package com.ticketrush.server.domain.concert;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class ConcertGraphQLController {

    private final ConcertRepository concertRepository;
    private final SeatZoneRepository seatZoneRepository;
    private final SeatRepository seatRepository;

    @QueryMapping
    public ConcertDetailResponse getConcertDetail(@Argument String concertId) {
        UUID concertUuid = UUID.fromString(concertId);
        Concert concert = concertRepository.findById(concertUuid)
                .orElseThrow(() -> new IllegalArgumentException("Concert not found: " + concertId));

        List<SeatZone> zones = seatZoneRepository.findByConcertId(concertUuid);

        List<ConcertDetailResponse.ZoneDetailResponse> zoneResponses = zones.stream().map(zone -> {
            List<Seat> seats = seatRepository.findAll().stream()
                    .filter(seat -> seat.getSeatZoneId().equals(zone.getId()))
                    .collect(Collectors.toList());

            List<ConcertDetailResponse.SeatDetailResponse> seatResponses = seats.stream().map(seat -> 
                ConcertDetailResponse.SeatDetailResponse.builder()
                        .id(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .status(seat.getStatus().name())
                        .heldByUserId(seat.getHeldByUserId())
                        .heldUntil(seat.getHeldUntil() != null ? seat.getHeldUntil().toString() : null)
                        .build()
            ).collect(Collectors.toList());

            return ConcertDetailResponse.ZoneDetailResponse.builder()
                    .id(zone.getId())
                    .name(zone.getName())
                    .price(zone.getPrice())
                    .totalSeats(zone.getTotalSeats())
                    .seats(seatResponses)
                    .build();
        }).collect(Collectors.toList());

        return ConcertDetailResponse.builder()
                .id(concert.getId())
                .title(concert.getTitle())
                .venue(concert.getVenue())
                .startTime(concert.getStartTime().toString())
                .status(concert.getStatus().name())
                .zones(zoneResponses)
                .build();
    }
}
