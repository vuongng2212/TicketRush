package com.ticketrush.server.infrastructure.seeding;

import com.ticketrush.server.domain.concert.Concert;
import com.ticketrush.server.domain.concert.ConcertRepository;
import com.ticketrush.server.domain.concert.Seat;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.concert.SeatZone;
import com.ticketrush.server.domain.concert.SeatZoneRepository;
import com.ticketrush.server.infrastructure.redis.RedisReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the seeder orchestration logic. The actual transactional
 * persistence is delegated to {@link ConcertSeederService} which is mocked here.
 */
class DatabaseSeederTest {

    // Mirror the 8 seed concert UUIDs from DatabaseSeeder.SEED_CONCERTS
    private static final List<UUID> SEED_CONCERT_IDS = List.of(
            UUID.fromString("00000000-0000-0000-0000-000000000001"),
            UUID.fromString("00000000-0000-0000-0000-000000000002"),
            UUID.fromString("00000000-0000-0000-0000-000000000003"),
            UUID.fromString("00000000-0000-0000-0000-000000000004"),
            UUID.fromString("00000000-0000-0000-0000-000000000005"),
            UUID.fromString("00000000-0000-0000-0000-000000000006"),
            UUID.fromString("00000000-0000-0000-0000-000000000007"),
            UUID.fromString("00000000-0000-0000-0000-000000000008"));

    private ConcertSeederService seederService;
    private DatabaseSeeder databaseSeeder;

    @BeforeEach
    void setUp() {
        seederService = mock(ConcertSeederService.class);
        databaseSeeder = new DatabaseSeeder(seederService);
    }

    @Test
    void run_iteratesAll8Concerts() throws Exception {
        // Mock all 8 to "succeed" with 100 seats each
        when(seederService.seedConcert(any(UUID.class), any(), any(), any(Integer.class),
                any(), any(), any(Integer.class), any(Integer.class), any(Integer.class)))
                .thenReturn(100);

        databaseSeeder.run();

        // Verify seederService.seedConcert was called 8 times (once per concert)
        verify(seederService, org.mockito.Mockito.times(8))
                .seedConcert(any(UUID.class), any(), any(), any(Integer.class),
                        any(), any(), any(Integer.class), any(Integer.class), any(Integer.class));

        // Capture all calls and verify they're for the 8 expected concerts
        ArgumentCaptor<UUID> idCaptor = ArgumentCaptor.forClass(UUID.class);
        verify(seederService, org.mockito.Mockito.times(8))
                .seedConcert(idCaptor.capture(), any(), any(), any(Integer.class),
                        any(), any(), any(Integer.class), any(Integer.class), any(Integer.class));
        List<UUID> calledIds = idCaptor.getAllValues();
        assertThat(calledIds).containsExactlyInAnyOrderElementsOf(SEED_CONCERT_IDS);
    }

    @Test
    void run_handlesIndividualConcertFailure() throws Exception {
        // First call throws, subsequent calls succeed
        when(seederService.seedConcert(any(UUID.class), any(), any(), any(Integer.class),
                any(), any(), any(Integer.class), any(Integer.class), any(Integer.class)))
                .thenThrow(new RuntimeException("seed failed"))
                .thenReturn(100); // subsequent calls return 100

        // Should not throw — exception is caught by the service's internal handling
        // (the service's @Transactional will roll back the failed concert, and the
        // seeder continues with the next one)
        databaseSeeder.run();

        // All 8 concerts are still attempted
        verify(seederService, org.mockito.Mockito.times(8))
                .seedConcert(any(UUID.class), any(), any(), any(Integer.class),
                        any(), any(), any(Integer.class), any(Integer.class), any(Integer.class));
    }

    @Test
    void run_skipsIfSeederReturnsZero() throws Exception {
        // All concerts return 0 (already seeded scenario)
        when(seederService.seedConcert(any(UUID.class), any(), any(), any(Integer.class),
                any(), any(), any(Integer.class), any(Integer.class), any(Integer.class)))
                .thenReturn(0);

        databaseSeeder.run();

        // All 8 concerts are still attempted
        verify(seederService, org.mockito.Mockito.times(8))
                .seedConcert(any(UUID.class), any(), any(), any(Integer.class),
                        any(), any(), any(Integer.class), any(Integer.class), any(Integer.class));
    }
}
