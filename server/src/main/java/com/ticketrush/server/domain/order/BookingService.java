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
                }
            }
        });
    }
}
