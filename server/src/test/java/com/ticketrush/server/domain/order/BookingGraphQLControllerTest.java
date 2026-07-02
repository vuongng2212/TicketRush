package com.ticketrush.server.domain.order;

import com.ticketrush.server.domain.concert.SeatUpdatedPayload;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.concert.SeatZoneRepository;
import com.ticketrush.server.domain.concert.ConcertRepository;
import com.ticketrush.server.domain.user.User;
import com.ticketrush.server.domain.user.UserRepository;
import com.ticketrush.server.infrastructure.graphql.SeatEventPublisher;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class BookingGraphQLControllerTest {

    private BookingGraphQLController controller;
    private BookingService bookingService;
    private UserRepository userRepository;
    private OrderRepository orderRepository;
    private TicketRepository ticketRepository;
    private SeatRepository seatRepository;
    private SeatZoneRepository seatZoneRepository;
    private ConcertRepository concertRepository;
    private SeatEventPublisher seatEventPublisher;

    @BeforeEach
    void setUp() {
        bookingService = Mockito.mock(BookingService.class);
        userRepository = Mockito.mock(UserRepository.class);
        orderRepository = Mockito.mock(OrderRepository.class);
        ticketRepository = Mockito.mock(TicketRepository.class);
        seatRepository = Mockito.mock(SeatRepository.class);
        seatZoneRepository = Mockito.mock(SeatZoneRepository.class);
        concertRepository = Mockito.mock(ConcertRepository.class);
        seatEventPublisher = Mockito.mock(SeatEventPublisher.class);
        controller = new BookingGraphQLController(
            bookingService, 
            userRepository, 
            orderRepository,
            ticketRepository,
            seatRepository,
            seatZoneRepository,
            concertRepository,
            seatEventPublisher
        );

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("test@example.com", "password")
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void holdSeat_shouldReturnOrder() {
        UUID seatId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(bookingService.holdSeat(eq(seatId), eq(userId), anyLong())).thenReturn(new Order());

        Order order = controller.holdSeat(seatId.toString());
        assertThat(order).isNotNull();
    }

    @Test
    void holdSeat_userNotFound() {
        UUID seatId = UUID.randomUUID();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.holdSeat(seatId.toString()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Authenticated user not found");
    }

    @Test
    void holdSeat_invalidUuid() {
        assertThatThrownBy(() -> controller.holdSeat("not-a-uuid"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void seatStatusUpdated_filtersByConcert() {
        UUID concertA = UUID.randomUUID();
        UUID concertB = UUID.randomUUID();
        SeatUpdatedPayload eventA = SeatUpdatedPayload.builder().concertId(concertA).status("HELD").build();
        SeatUpdatedPayload eventB = SeatUpdatedPayload.builder().concertId(concertB).status("AVAILABLE").build();

        when(seatEventPublisher.getEventStream()).thenReturn(Flux.just(eventA, eventB));

        Flux<SeatUpdatedPayload> stream = controller.seatStatusUpdated(concertA.toString());

        StepVerifier.create(stream)
                .expectNext(eventA)
                .verifyComplete();
    }

    @Test
    void seatStatusUpdated_invalidUuid() {
        assertThatThrownBy(() -> controller.seatStatusUpdated("not-a-uuid"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
