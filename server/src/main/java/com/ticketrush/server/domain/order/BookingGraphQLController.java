package com.ticketrush.server.domain.order;

import com.ticketrush.server.domain.user.User;
import com.ticketrush.server.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class BookingGraphQLController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
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
}
