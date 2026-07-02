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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
 * <p>
 * The seeder always creates a fresh concert (no existsById pre-check); the
 * DatabaseSeeder is responsible for guarding against re-runs at a higher level
 * if needed. These tests pin down that contract.
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
    void seedConcert_persistsAndInitializesRedis() {
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

        // Concert persisted (production uses save() + flush(), not saveAndFlush())
        ArgumentCaptor<Concert> concertCaptor = ArgumentCaptor.forClass(Concert.class);
        verify(concertRepository).save(concertCaptor.capture());
        verify(concertRepository).flush();
        Concert saved = concertCaptor.getValue();
        assertThat(saved.getId()).isEqualTo(CONCERT_ID);
        assertThat(saved.getTitle()).isEqualTo("Test Concert");
        assertThat(saved.getStatus().name()).isEqualTo("OPEN");
        assertThat(saved.getCity()).isEqualTo("Sài Gòn");
        assertThat(saved.getArtist()).isEqualTo("Test Artist");
        assertThat(saved.getTicketStatus()).isEqualTo(TicketStatus.ON_SALE);

        // 3 zones saved via the standard save() method
        verify(seatZoneRepository, org.mockito.Mockito.times(3)).save(any(SeatZone.class));

        // Seats saved
        ArgumentCaptor<List<Seat>> seatsCaptor = ArgumentCaptor.forClass(List.class);
        verify(seatRepository).saveAll(seatsCaptor.capture());
        verify(seatRepository).flush();
        assertThat(seatsCaptor.getValue()).hasSize(350);

        // Redis initialized
        verify(redisReservationService).initializeSeats(eq(CONCERT_ID), anyList());
    }

    @Test
    void seedConcert_propagatesConcertPersistFailure() {
        doThrow(new RuntimeException("save failed"))
                .when(concertRepository).save(any(Concert.class));

        assertThatThrownBy(() -> service.seedConcert(
                CONCERT_ID, "Test", "Venue", 30,
                new BigDecimal("100"), new BigDecimal("200"),
                10, 20, 30,
                "Hà Nội", "Test Artist", TicketStatus.ON_SALE))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("save failed");

        // Concert was attempted to be saved, then the exception aborted the rest
        verify(concertRepository).save(any(Concert.class));
        verify(seatZoneRepository, never()).save(any(SeatZone.class));
        verify(seatRepository, never()).saveAll(anyList());
        verify(redisReservationService, never()).initializeSeats(any(), anyList());
    }

    @Test
    void seedConcert_propagatesSeatSaveFailure() {
        when(seatRepository.saveAll(anyList()))
                .thenThrow(new RuntimeException("seat save failed"));

        // Zone saves use the same mock so they don't throw
        assertThatThrownBy(() -> service.seedConcert(
                CONCERT_ID, "Test", "Venue", 30,
                new BigDecimal("100"), new BigDecimal("200"),
                10, 20, 30,
                "Đà Nẵng", "Test Artist", TicketStatus.COMING_SOON))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("seat save failed");

        // No Redis init since seat save failed and the exception propagated
        verify(redisReservationService, never()).initializeSeats(any(), anyList());
    }
}
