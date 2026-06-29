package com.ticketrush.server.domain.concert;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

class ConcertGraphQLControllerTest {

    private ConcertGraphQLController controller;
    private ConcertRepository concertRepository;
    private SeatZoneRepository seatZoneRepository;
    private SeatRepository seatRepository;

    @BeforeEach
    void setUp() {
        concertRepository = Mockito.mock(ConcertRepository.class);
        seatZoneRepository = Mockito.mock(SeatZoneRepository.class);
        seatRepository = Mockito.mock(SeatRepository.class);
        controller = new ConcertGraphQLController(concertRepository, seatZoneRepository, seatRepository);
    }

    @Test
    void getConcertDetail_shouldReturnConcertDetail() {
        UUID concertId = UUID.randomUUID();
        Concert concert = new Concert();
        concert.setId(concertId);
        concert.setTitle("Test Concert");
        concert.setVenue("Test Venue");
        concert.setStartTime(LocalDateTime.now());
        concert.setStatus(ConcertStatus.OPEN);

        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        when(seatZoneRepository.findByConcertId(concertId)).thenReturn(List.of());

        ConcertDetailResponse response = controller.getConcertDetail(concertId.toString());

        assertThat(response.getId()).isEqualTo(concertId);
        assertThat(response.getTitle()).isEqualTo("Test Concert");
        assertThat(response.getVenue()).isEqualTo("Test Venue");
        assertThat(response.getStatus()).isEqualTo("OPEN");
        assertThat(response.getZones()).isEmpty();
    }

    @Test
    void getConcertDetail_concertNotFound() {
        UUID concertId = UUID.randomUUID();
        when(concertRepository.findById(concertId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.getConcertDetail(concertId.toString()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Concert not found");
    }

    @Test
    void getConcertDetail_invalidUuidString() {
        assertThatThrownBy(() -> controller.getConcertDetail("not-a-uuid"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getConcertDetail_withZonesAndSeats() {
        UUID concertId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();

        Concert concert = Concert.builder()
                .id(concertId)
                .title("Concert A")
                .venue("Venue A")
                .startTime(LocalDateTime.of(2030, 1, 1, 19, 0))
                .status(ConcertStatus.OPEN)
                .build();

        SeatZone zone = SeatZone.builder()
                .id(zoneId)
                .concertId(concertId)
                .name("VIP")
                .price(new BigDecimal("500.00"))
                .totalSeats(1)
                .build();

        Seat seat = Seat.builder()
                .id(seatId)
                .seatZoneId(zoneId)
                .seatNumber("VIP-1")
                .status(SeatStatus.AVAILABLE)
                .heldUntil(null)
                .build();

        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        when(seatZoneRepository.findByConcertId(concertId)).thenReturn(List.of(zone));
        when(seatRepository.findAll()).thenReturn(List.of(seat));

        ConcertDetailResponse response = controller.getConcertDetail(concertId.toString());

        assertThat(response.getZones()).hasSize(1);
        ConcertDetailResponse.ZoneDetailResponse zoneResponse = response.getZones().get(0);
        assertThat(zoneResponse.getId()).isEqualTo(zoneId);
        assertThat(zoneResponse.getName()).isEqualTo("VIP");
        assertThat(zoneResponse.getPrice()).isEqualByComparingTo("500.00");
        assertThat(zoneResponse.getSeats()).hasSize(1);
        assertThat(zoneResponse.getSeats().get(0).getSeatNumber()).isEqualTo("VIP-1");
        assertThat(zoneResponse.getSeats().get(0).getStatus()).isEqualTo("AVAILABLE");
        assertThat(zoneResponse.getSeats().get(0).getHeldUntil()).isNull();
    }

    @Test
    void getConcertDetail_zoneWithHeldSeat() {
        UUID concertId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LocalDateTime heldUntil = LocalDateTime.of(2030, 1, 1, 20, 0);

        Concert concert = Concert.builder()
                .id(concertId)
                .title("Concert A")
                .venue("Venue A")
                .startTime(LocalDateTime.of(2030, 1, 1, 19, 0))
                .status(ConcertStatus.OPEN)
                .build();

        SeatZone zone = SeatZone.builder()
                .id(zoneId)
                .concertId(concertId)
                .name("VIP")
                .price(new BigDecimal("500.00"))
                .totalSeats(1)
                .build();

        Seat seat = Seat.builder()
                .id(seatId)
                .seatZoneId(zoneId)
                .seatNumber("VIP-1")
                .status(SeatStatus.HELD)
                .heldByUserId(userId)
                .heldUntil(heldUntil)
                .build();

        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        when(seatZoneRepository.findByConcertId(concertId)).thenReturn(List.of(zone));
        when(seatRepository.findAll()).thenReturn(List.of(seat));

        ConcertDetailResponse response = controller.getConcertDetail(concertId.toString());

        assertThat(response.getZones().get(0).getSeats().get(0).getStatus()).isEqualTo("HELD");
        assertThat(response.getZones().get(0).getSeats().get(0).getHeldByUserId()).isEqualTo(userId);
        assertThat(response.getZones().get(0).getSeats().get(0).getHeldUntil()).isEqualTo("2030-01-01T20:00");
    }

    @Test
    void getConcertDetail_filtersSeatsByZone() {
        UUID concertId = UUID.randomUUID();
        UUID zoneA = UUID.randomUUID();
        UUID zoneB = UUID.randomUUID();

        Concert concert = Concert.builder()
                .id(concertId)
                .title("C")
                .venue("V")
                .startTime(LocalDateTime.now())
                .status(ConcertStatus.OPEN)
                .build();

        SeatZone zoneAEntity = SeatZone.builder()
                .id(zoneA).concertId(concertId).name("A")
                .price(BigDecimal.TEN).totalSeats(1).build();
        SeatZone zoneBEntity = SeatZone.builder()
                .id(zoneB).concertId(concertId).name("B")
                .price(BigDecimal.TEN).totalSeats(1).build();

        Seat seatInA = Seat.builder()
                .id(UUID.randomUUID()).seatZoneId(zoneA).seatNumber("A-1")
                .status(SeatStatus.AVAILABLE).build();
        Seat seatInB = Seat.builder()
                .id(UUID.randomUUID()).seatZoneId(zoneB).seatNumber("B-1")
                .status(SeatStatus.AVAILABLE).build();

        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        when(seatZoneRepository.findByConcertId(concertId)).thenReturn(List.of(zoneAEntity, zoneBEntity));
        when(seatRepository.findAll()).thenReturn(List.of(seatInA, seatInB));

        ConcertDetailResponse response = controller.getConcertDetail(concertId.toString());

        assertThat(response.getZones()).hasSize(2);
        assertThat(response.getZones().get(0).getSeats())
                .extracting(ConcertDetailResponse.SeatDetailResponse::getSeatNumber)
                .containsExactly("A-1");
        assertThat(response.getZones().get(1).getSeats())
                .extracting(ConcertDetailResponse.SeatDetailResponse::getSeatNumber)
                .containsExactly("B-1");
    }
}
