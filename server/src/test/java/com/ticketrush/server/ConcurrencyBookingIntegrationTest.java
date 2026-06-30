package com.ticketrush.server;

import com.ticketrush.server.domain.concert.*;
import com.ticketrush.server.domain.order.BookingService;
import com.ticketrush.server.domain.order.Order;
import com.ticketrush.server.domain.order.OrderRepository;
import com.ticketrush.server.domain.order.OrderStatus;
import com.ticketrush.server.domain.user.User;
import com.ticketrush.server.domain.user.UserRepository;
import com.ticketrush.server.infrastructure.redis.RedisReservationService;
import com.ticketrush.server.infrastructure.graphql.SeatEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ConcurrencyBookingIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConcertRepository concertRepository;

    @Autowired
    private SeatZoneRepository seatZoneRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RedisReservationService redisReservationService;

    @Autowired
    private SeatEventPublisher seatEventPublisher;

    private Concert concert;
    private SeatZone zone;
    private Seat seat;
    private List<User> testUsers;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        seatRepository.deleteAll();
        seatZoneRepository.deleteAll();
        concertRepository.deleteAll();
        userRepository.deleteAll();

        // Setup Concert
        concert = Concert.builder()
                .title("Blackpink World Tour")
                .venue("My Dinh Stadium")
                .startTime(LocalDateTime.now().plusDays(10))
                .status(ConcertStatus.OPEN)
                .city("Hà Nội")
                .artist("BLACKPINK")
                .ticketStatus(TicketStatus.ON_SALE)
                .build();
        concert = concertRepository.save(concert);

        // Setup Seat Zone
        zone = SeatZone.builder()
                .concertId(concert.getId())
                .name("VIP A")
                .price(new BigDecimal("250.00"))
                .totalSeats(10)
                .build();
        zone = seatZoneRepository.save(zone);

        // Setup Single Seat to test race conditions
        seat = Seat.builder()
                .seatZoneId(zone.getId())
                .seatNumber("VIP-01")
                .status(SeatStatus.AVAILABLE)
                .build();
        seat = seatRepository.save(seat);

        // Warm up Redis for this concert & seat
        redisReservationService.initializeSeats(concert.getId(), List.of(seat.getId()));

        // Create 20 test users
        testUsers = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            User user = User.builder()
                    .email("user" + i + "@ticketrush.com")
                    .password("password")
                    .roles(List.of("ROLE_USER"))
                    .build();
            testUsers.add(userRepository.save(user));
        }
    }

    @Test
    void testConcurrentBookingForSingleSeatAndSubscriptionBroadcast() throws InterruptedException {
        int numberOfThreads = 20;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        // Subscribe to seat events stream before booking
        Flux<SeatUpdatedPayload> eventFlux = seatEventPublisher.getEventStream()
                .filter(event -> event.getConcertId().equals(concert.getId()));

        StepVerifier verifier = StepVerifier.create(eventFlux)
                .assertNext(event -> {
                    assertThat(event.getSeatId()).isEqualTo(seat.getId());
                    assertThat(event.getStatus()).isEqualTo("HELD");
                    assertThat(event.getHeldByUserId()).isNotNull();
                })
                .thenCancel()
                .verifyLater();

        for (int i = 0; i < numberOfThreads; i++) {
            final User user = testUsers.get(i);
            executorService.submit(() -> {
                try {
                    latch.await(); // Wait for all threads to start simultaneously
                    bookingService.holdSeat(seat.getId(), user.getId(), 5000); // 5 sec lease
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        latch.countDown(); // Kick off all threads
        doneLatch.await(); // Wait for execution to finish

        // Assertions for booking
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(numberOfThreads - 1);

        // Verify that subscription broadcast received exactly 1 HELD event
        verifier.verify(Duration.ofSeconds(3));

        // Double check seat status in DB and Redis
        Seat updatedSeat = seatRepository.findById(seat.getId()).orElseThrow();
        assertThat(updatedSeat.getStatus()).isEqualTo(SeatStatus.HELD);
        
        Boolean isHeldInRedis = redisReservationService.holdSeat(concert.getId(), seat.getId(), UUID.randomUUID());
        // Since it's held, trying to hold it again must return false
        assertThat(isHeldInRedis).isFalse();
    }

    @Test
    void testRabbitMQDelayedExpirationReleaseAndBroadcast() throws InterruptedException {
        // Hold seat with a short delay of 1.5 seconds (1500 ms)
        User user = testUsers.get(0);
        Order order = bookingService.holdSeat(seat.getId(), user.getId(), 1500);

        // Assert hold is active
        Seat lockedSeat = seatRepository.findById(seat.getId()).orElseThrow();
        assertThat(lockedSeat.getStatus()).isEqualTo(SeatStatus.HELD);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);

        // Wait 3.5 seconds to let RabbitMQ deliver delayed message and let consumer handle expiration
        Thread.sleep(3500);

        // Assert seat is back to available
        Seat releasedSeat = seatRepository.findById(seat.getId()).orElseThrow();
        assertThat(releasedSeat.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        assertThat(releasedSeat.getHeldByUserId()).isNull();

        Order expiredOrder = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(expiredOrder.getStatus()).isEqualTo(OrderStatus.EXPIRED);
    }
}
