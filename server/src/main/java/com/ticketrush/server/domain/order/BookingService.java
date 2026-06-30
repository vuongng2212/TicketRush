package com.ticketrush.server.domain.order;

import com.ticketrush.server.domain.concert.Seat;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.concert.SeatStatus;
import com.ticketrush.server.domain.concert.SeatZone;
import com.ticketrush.server.domain.concert.SeatZoneRepository;
import com.ticketrush.server.infrastructure.redis.RedisReservationService;
import com.ticketrush.server.infrastructure.rabbitmq.ExpirationMessageProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final SeatRepository seatRepository;
    private final SeatZoneRepository seatZoneRepository;
    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final RedisReservationService redisReservationService;
    private final ExpirationMessageProducer expirationProducer;
    private final com.ticketrush.server.infrastructure.graphql.SeatEventPublisher seatEventPublisher;

    @Transactional
    public Order holdSeat(UUID seatId, UUID userId, long delayMillis) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + seatId));

        SeatZone zone = seatZoneRepository.findById(seat.getSeatZoneId())
                .orElseThrow(() -> new IllegalArgumentException("Seat zone not found: " + seat.getSeatZoneId()));

        // 1. Lock on Redis first
        boolean lockedOnRedis = redisReservationService.holdSeat(zone.getConcertId(), seatId, userId);
        if (!lockedOnRedis) {
            throw new IllegalStateException("Seat is already held or sold");
        }

        try {
            // 2. Lock on Database
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new IllegalStateException("Seat is not available in database");
            }

            LocalDateTime now = LocalDateTime.now();
            seat.setStatus(SeatStatus.HELD);
            seat.setHeldByUserId(userId);
            seat.setHeldUntil(now.plusNanos(delayMillis * 1_000_000));
            seatRepository.save(seat);

            // 3. Create Pending Order
            Order order = Order.builder()
                    .userId(userId)
                    .status(OrderStatus.PENDING_PAYMENT)
                    .totalPrice(zone.getPrice())
                    .expiresAt(now.plusNanos(delayMillis * 1_000_000))
                    .build();
            order = orderRepository.save(order);

            // 4. Create Ticket reservation
            Ticket ticket = Ticket.builder()
                    .orderId(order.getId())
                    .seatId(seatId)
                    .ticketCode(UUID.randomUUID().toString())
                    .build();
            ticketRepository.save(ticket);

            // 5. Send Expiration message to RabbitMQ
            expirationProducer.sendExpirationMessage(order.getId(), delayMillis);

            // 6. Broadcast event
            seatEventPublisher.publish(com.ticketrush.server.domain.concert.SeatUpdatedPayload.builder()
                    .seatId(seatId)
                    .concertId(zone.getConcertId())
                    .status("HELD")
                    .heldByUserId(userId)
                    .build());

            return order;
        } catch (Exception e) {
            log.error("Failed to hold seat in database, triggering Redis rollback for seat: {}", seatId, e);
            redisReservationService.releaseSeat(zone.getConcertId(), seatId);
            throw e;
        }
    }

    @Transactional
    public void releaseExpiredOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Order not found during expiration check: {}", orderId);
            return;
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            log.info("Order: {} is not in PENDING_PAYMENT status (current: {}), skipping release.", orderId, order.getStatus());
            return;
        }

        log.info("Expiring order: {} and releasing held seats...", orderId);

        // 1. Expire order
        order.setStatus(OrderStatus.EXPIRED);
        orderRepository.save(order);

        // 2. Release corresponding tickets & seats
        ticketRepository.findByOrderId(orderId).forEach(ticket -> {
            Seat seat = seatRepository.findById(ticket.getSeatId()).orElse(null);
            if (seat != null && seat.getStatus() == SeatStatus.HELD) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHeldByUserId(null);
                seat.setHeldUntil(null);
                seatRepository.save(seat);

                SeatZone zone = seatZoneRepository.findById(seat.getSeatZoneId()).orElse(null);
                if (zone != null) {
                    // Release on Redis
                    redisReservationService.releaseSeat(zone.getConcertId(), seat.getId());
                    
                    // Broadcast event
                    seatEventPublisher.publish(com.ticketrush.server.domain.concert.SeatUpdatedPayload.builder()
                            .seatId(seat.getId())
                            .concertId(zone.getConcertId())
                            .status("AVAILABLE")
                            .heldByUserId(null)
                            .build());
                }
            }
        });
    }

    @Transactional
    public PaymentResult confirmPayment(UUID orderId, UUID userId, PaymentMethod paymentMethod) {
        // 1. Find order, verify ownership
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found or not owned by user: " + orderId));

        // 2. Verify status
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Order is not in PENDING_PAYMENT status (current: " + order.getStatus() + ")");
        }

        // 3. Verify not expired
        if (order.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Order has expired");
        }

        // 4. Get ticket for this order
        List<Ticket> tickets = ticketRepository.findByOrderId(orderId);
        if (tickets.isEmpty()) {
            throw new IllegalStateException("No ticket found for order: " + orderId);
        }
        Ticket ticket = tickets.get(0);

        // 5. Update order to COMPLETED
        order.setStatus(OrderStatus.COMPLETED);
        order = orderRepository.save(order);

        // 6. Update seat to SOLD
        Seat seat = seatRepository.findById(ticket.getSeatId())
                .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + ticket.getSeatId()));
        seat.setStatus(SeatStatus.SOLD);
        seatRepository.save(seat);

        // 7. Generate fake payment reference
        String paymentReference = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 8. Build and return PaymentResult
        return PaymentResult.builder()
                .order(order)
                .ticket(ticket)
                .paymentReference(paymentReference)
                .paymentMethod(paymentMethod)
                .paidAt(LocalDateTime.now())
                .totalPrice(order.getTotalPrice())
                .build();
    }

    @Transactional
    public Order cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found or not owned by user: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Only PENDING_PAYMENT orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Release tickets & seats
        ticketRepository.findByOrderId(orderId).forEach(ticket -> {
            Seat seat = seatRepository.findById(ticket.getSeatId()).orElse(null);
            if (seat != null) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHeldByUserId(null);
                seat.setHeldUntil(null);
                seatRepository.save(seat);

                // Find zone to get concertId for Redis release + event broadcast
                seatZoneRepository.findById(seat.getSeatZoneId()).ifPresent(zone -> {
                    redisReservationService.releaseSeat(zone.getConcertId(), seat.getId());
                    seatEventPublisher.publish(com.ticketrush.server.domain.concert.SeatUpdatedPayload.builder()
                            .seatId(seat.getId())
                            .concertId(zone.getConcertId())
                            .status("AVAILABLE")
                            .heldByUserId(null)
                            .build());
                });
            }
        });

        return order;
    }
}
