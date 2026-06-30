package com.ticketrush.server.infrastructure.seeding;

import com.ticketrush.server.domain.concert.*;
import com.ticketrush.server.infrastructure.redis.RedisReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link ConcertSeederService}. Note: the @Transactional annotation
 * has no effect in pure unit tests (no Spring context), but the business logic
 * is fully exercised.
 */
class ConcertSeederServiceTest {

    private static final UUID CONCERT_ID = UUID.fromString("00000000-0000-0000-0000-000000000099");

    private ConcertRepository concertRepository;
    private SeatZoneRepository seatZoneRepository;
    private SeatRepository seatRepository;
    private RedisReservationService redisReservationService;
    private ConcertSeederService service;

    @BeforeEach
    void setUp() {
        concertRepository = mock(ConcertRepository.class);
        seatZoneRepository = mock(SeatZoneRepository.class);
        seatRepository = mock(SeatRepository.class);
        redisReservationService = mock(RedisReservationService.class);
        service = new ConcertSeederService(
                concertRepository, seatZoneRepository, seatRepository,
                redisReservationService);
    }

    @Test
    void seedConcert_skipsIfAlreadyExists() {
        when(concertRepository.existsById(CONCERT_ID)).thenReturn(true);

        int result = service.seedConcert(
                CONCERT_ID, "Test", "Venue", 30,
                new BigDecimal("100"), new BigDecimal("200"),
                10, 20, 30,
                "Hà Nội", "Test Artist", TicketStatus.ON_SALE);

        assertThat(result).isZero();
        verify(concertRepository, never()).saveAndFlush(any(Concert.class));
        verify(seatZoneRepository, never()).saveAndFlush(any(SeatZone.class));
        verify(seatRepository, never()).saveAll(anyList());
        verify(redisReservationService, never()).initializeSeats(any(), anyList());
    }

    @Test
    void seedConcert_persistsAndInitializesRedis() {
        when(concertRepository.existsById(CONCERT_ID)).thenReturn(false);
        when(seatZoneRepository.saveAndFlush(any(SeatZone.class))).thenAnswer(inv -> inv.getArgument(0));
        when(seatRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<Seat> seats = inv.getArgument(0);
            for (Seat s : seats) {
                if (s.getId() == null) s.setId(UUID.randomUUID());
            }
            return seats;
        });

        int result = service.seedConcert(
                CONCERT_ID, "Test Concert", "Test Venue", 30,
                new BigDecimal("100000"), new BigDecimal("500000"),
                50, 100, 200,
                "Sài Gòn", "Test Artist", TicketStatus.ON_SALE);

        // 50 + 100 + 200 = 350 seats
        assertThat(result).isEqualTo(350);

        // Concert persisted
        ArgumentCaptor<Concert> concertCaptor = ArgumentCaptor.forClass(Concert.class);
        verify(concertRepository).saveAndFlush(concertCaptor.capture());
        assertThat(concertCaptor.getValue().getId()).isEqualTo(CONCERT_ID);
        assertThat(concertCaptor.getValue().getTitle()).isEqualTo("Test Concert");
        assertThat(concertCaptor.getValue().getStatus().name()).isEqualTo("OPEN");
        assertThat(concertCaptor.getValue().getCity()).isEqualTo("Sài Gòn");
        assertThat(concertCaptor.getValue().getArtist()).isEqualTo("Test Artist");
        assertThat(concertCaptor.getValue().getTicketStatus()).isEqualTo(TicketStatus.ON_SALE);

        // 3 zones saved
        verify(seatZoneRepository, org.mockito.Mockito.times(3)).saveAndFlush(any(SeatZone.class));

        // Seats saved
        ArgumentCaptor<List<Seat>> seatsCaptor = ArgumentCaptor.forClass(List.class);
        verify(seatRepository).saveAll(seatsCaptor.capture());
        assertThat(seatsCaptor.getValue()).hasSize(350);

        // Redis initialized
        verify(redisReservationService).initializeSeats(eq(CONCERT_ID), anyList());
    }

    @Test
    void seedConcert_handlesConcertPersistFailure() {
        when(concertRepository.existsById(CONCERT_ID)).thenReturn(false);
        doThrow(new RuntimeException("save failed"))
                .when(concertRepository).saveAndFlush(any(Concert.class));

        int result = service.seedConcert(
                CONCERT_ID, "Test", "Venue", 30,
                new BigDecimal("100"), new BigDecimal("200"),
                10, 20, 30,
                "Hà Nội", "Test Artist", TicketStatus.ON_SALE);

        assertThat(result).isZero();
        verify(seatZoneRepository, never()).saveAndFlush(any(SeatZone.class));
        verify(seatRepository, never()).saveAll(anyList());
        verify(redisReservationService, never()).initializeSeats(any(), anyList());
    }

    @Test
    void seedConcert_handlesSeatSaveFailure() {
        when(concertRepository.existsById(CONCERT_ID)).thenReturn(false);
        when(seatZoneRepository.saveAndFlush(any(SeatZone.class))).thenAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("seat save failed"))
                .when(seatRepository).saveAll(anyList());

        int result = service.seedConcert(
                CONCERT_ID, "Test", "Venue", 30,
                new BigDecimal("100"), new BigDecimal("200"),
                10, 20, 30,
                "Đà Nẵng", "Test Artist", TicketStatus.COMING_SOON);

        assertThat(result).isZero();
        // No Redis init since seat save failed
        verify(redisReservationService, never()).initializeSeats(any(), anyList());
    }
}
