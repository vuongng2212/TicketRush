package com.ticketrush.server.infrastructure.seeding;

import com.ticketrush.server.domain.concert.Concert;
import com.ticketrush.server.domain.concert.ConcertRepository;
import com.ticketrush.server.domain.concert.Seat;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.concert.SeatZone;
import com.ticketrush.server.domain.concert.SeatZoneRepository;
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

class DatabaseSeederTest {

    private ConcertRepository concertRepository;
    private SeatZoneRepository seatZoneRepository;
    private SeatRepository seatRepository;
    private DatabaseSeeder databaseSeeder;

    @BeforeEach
    void setUp() {
        concertRepository = mock(ConcertRepository.class);
        seatZoneRepository = mock(SeatZoneRepository.class);
        seatRepository = mock(SeatRepository.class);
        databaseSeeder = new DatabaseSeeder(concertRepository, seatZoneRepository, seatRepository);
    }

    @Test
    void run_skipsWhenConcertAlreadySeeded() throws Exception {
        UUID concertId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(concertRepository.existsById(concertId)).thenReturn(true);

        databaseSeeder.run();

        verify(concertRepository, never()).save(any(Concert.class));
        verify(seatZoneRepository, never()).save(any(SeatZone.class));
        verify(seatRepository, never()).saveAll(anyList());
    }

    @Test
    void run_seedsAllDataWhenFresh() throws Exception {
        UUID concertId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(concertRepository.existsById(concertId)).thenReturn(false);
        when(concertRepository.save(any(Concert.class))).thenAnswer(inv -> inv.getArgument(0));
        when(seatZoneRepository.save(any(SeatZone.class))).thenAnswer(inv -> inv.getArgument(0));

        databaseSeeder.run();

        ArgumentCaptor<Concert> concertCaptor = ArgumentCaptor.forClass(Concert.class);
        verify(concertRepository).save(concertCaptor.capture());
        assertThat(concertCaptor.getValue().getId()).isEqualTo(concertId);
        assertThat(concertCaptor.getValue().getTitle()).isEqualTo("TicketRush Live Concert");
        assertThat(concertCaptor.getValue().getStatus().name()).isEqualTo("OPEN");

        verify(seatZoneRepository, org.mockito.Mockito.times(2)).save(any(SeatZone.class));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Seat>> seatsCaptor = ArgumentCaptor.forClass(List.class);
        verify(seatRepository).saveAll(seatsCaptor.capture());
        assertThat(seatsCaptor.getValue()).hasSize(2000);
    }

    @Test
    void run_handlesConcertSaveConflict() throws Exception {
        UUID concertId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(concertRepository.existsById(concertId)).thenReturn(false);
        when(concertRepository.save(any(Concert.class)))
                .thenThrow(new RuntimeException("conflict"));

        databaseSeeder.run();

        verify(seatZoneRepository, never()).save(any(SeatZone.class));
        verify(seatRepository, never()).saveAll(anyList());
    }

    @Test
    void run_handlesZoneSaveConflict() throws Exception {
        UUID concertId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(concertRepository.existsById(concertId)).thenReturn(false);
        when(concertRepository.save(any(Concert.class))).thenAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("zone conflict"))
                .when(seatZoneRepository).save(any(SeatZone.class));

        databaseSeeder.run();

        verify(seatRepository).saveAll(anyList());
    }

    @Test
    void run_handlesSeatSaveConflict() throws Exception {
        UUID concertId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(concertRepository.existsById(concertId)).thenReturn(false);
        when(concertRepository.save(any(Concert.class))).thenAnswer(inv -> inv.getArgument(0));
        when(seatZoneRepository.save(any(SeatZone.class))).thenAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("seats conflict")).when(seatRepository).saveAll(anyList());

        databaseSeeder.run();
    }
}
