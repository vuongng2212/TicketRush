package com.ticketrush.server.domain.order;

import com.ticketrush.server.domain.concert.Seat;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.concert.SeatZone;
import com.ticketrush.server.domain.concert.SeatZoneRepository;
import com.ticketrush.server.domain.concert.Concert;
import com.ticketrush.server.domain.concert.ConcertRepository;
import com.ticketrush.server.domain.user.User;
import com.ticketrush.server.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class BookingGraphQLController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final SeatRepository seatRepository;
    private final SeatZoneRepository seatZoneRepository;
    private final ConcertRepository concertRepository;
    private final com.ticketrush.server.infrastructure.graphql.SeatEventPublisher seatEventPublisher;

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Order holdSeat(@Argument String seatId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found in database"));

        // 10 minutes lease (600,000 ms)
        long delayMillis = 600_000;
        return bookingService.holdSeat(UUID.fromString(seatId), user.getId(), delayMillis);
    }

    @org.springframework.graphql.data.method.annotation.SubscriptionMapping
    public reactor.core.publisher.Flux<com.ticketrush.server.domain.concert.SeatUpdatedPayload> seatStatusUpdated(@Argument String concertId) {
        UUID concertUuid = UUID.fromString(concertId);
        return seatEventPublisher.getEventStream()
                .filter(event -> event.getConcertId().equals(concertUuid));
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public PaymentResult confirmPayment(
            @Argument String orderId,
            @Argument PaymentMethod paymentMethod) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found in database"));
        return bookingService.confirmPayment(UUID.fromString(orderId), user.getId(), paymentMethod);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Order cancelOrder(@Argument String orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found in database"));
        return bookingService.cancelOrder(UUID.fromString(orderId), user.getId());
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Order> getMyOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found in database"));
        return orderRepository.findByUserId(user.getId());
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<MyTicketDetail> getMyTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found in database"));

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<MyTicketDetail> allTickets = new ArrayList<>();

        for (Order order : orders) {
            List<Ticket> tickets = ticketRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
            for (Ticket ticket : tickets) {
                Seat seat = seatRepository.findById(ticket.getSeatId()).orElse(null);
                if (seat == null) continue;
                SeatZone zone = seatZoneRepository.findById(seat.getSeatZoneId()).orElse(null);
                if (zone == null) continue;
                Concert concert = concertRepository.findById(zone.getConcertId()).orElse(null);
                if (concert == null) continue;

                allTickets.add(MyTicketDetail.builder()
                        .id(ticket.getId())
                        .ticketCode(ticket.getTicketCode())
                        .concertTitle(concert.getTitle())
                        .venue(concert.getVenue())
                        .startTime(concert.getStartTime() != null ? concert.getStartTime().toString() : null)
                        .zoneName(zone.getName())
                        .seatNumber(seat.getSeatNumber())
                        .price(zone.getPrice())
                        .orderStatus(order.getStatus() != null ? order.getStatus().name() : null)
                        .orderId(order.getId())
                        .build());
            }
        }

        return allTickets;
    }
}
