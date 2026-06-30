package com.ticketrush.server.domain.concert;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class ConcertGraphQLController {

    private static final int DEFAULT_LIST_LIMIT = 50;
    private static final int DEFAULT_FEATURED_LIMIT = 8;
    private static final String IMAGE_PLACEHOLDER_BASE = "https://picsum.photos/seed/";

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

    /**
     * Returns a list of concerts with summary statistics suitable for list/grid views.
     * When {@code status} is null/blank all concerts are returned. Results are ordered
     * by start time ascending and capped at {@code limit} (default 50).
     *
     * @param status optional concert status filter (e.g. "OPEN"); null/empty means no filter
     * @param limit  optional maximum number of results; defaults to {@value #DEFAULT_LIST_LIMIT}; must be &gt; 0
     * @return list of concert summaries, possibly empty
     */
    @QueryMapping
    public List<ConcertSummaryResponse> getConcerts(
            @Argument String status,
            @Argument Integer limit) {

        int effectiveLimit = (limit == null || limit <= 0) ? DEFAULT_LIST_LIMIT : limit;

        List<Concert> concerts;
        if (status == null || status.isBlank()) {
            concerts = concertRepository.findAllByOrderByStartTimeAsc();
        } else {
            ConcertStatus parsedStatus = parseStatus(status);
            concerts = concertRepository.findByStatusOrderByStartTimeAsc(parsedStatus);
        }

        return concerts.stream()
                .limit(effectiveLimit)
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    /**
     * Returns a short list of "featured" concerts (default 8) restricted to OPEN status,
     * ordered by start time ascending. Intended for the homepage carousel.
     *
     * @param limit optional maximum number of results; defaults to {@value #DEFAULT_FEATURED_LIMIT}; must be &gt; 0
     * @return list of featured concert summaries, possibly empty
     */
    @QueryMapping
    public List<ConcertSummaryResponse> getFeaturedConcerts(
            @Argument Integer limit) {

        int effectiveLimit = (limit == null || limit <= 0) ? DEFAULT_FEATURED_LIMIT : limit;

        List<Concert> featured = concertRepository.findTop8ByStatusOrderByStartTimeAsc(ConcertStatus.OPEN);

        return featured.stream()
                .limit(effectiveLimit)
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    /**
     * Builds a {@link ConcertSummaryResponse} from a {@link Concert}, computing
     * available-seat counts and price range from the related zones and seats.
     */
    private ConcertSummaryResponse toSummary(Concert concert) {
        UUID concertId = concert.getId();

        List<SeatZone> zones = seatZoneRepository.findByConcertId(concertId);
        int zoneCount = zones.size();

        double minPrice = 0.0;
        double maxPrice = 0.0;
        if (!zones.isEmpty()) {
            BigDecimal minBd = zones.stream()
                    .map(SeatZone::getPrice)
                    .min(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
            BigDecimal maxBd = zones.stream()
                    .map(SeatZone::getPrice)
                    .max(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
            minPrice = minBd.doubleValue();
            maxPrice = maxBd.doubleValue();
        }

        int availableSeats = (int) seatRepository.findAllByConcertId(concertId).stream()
                .filter(seat -> seat.getStatus() == SeatStatus.AVAILABLE)
                .count();

        String imageUrl = IMAGE_PLACEHOLDER_BASE + concertId + "/800/600";

        return ConcertSummaryResponse.builder()
                .id(concertId)
                .title(concert.getTitle())
                .description(concert.getDescription())
                .venue(concert.getVenue())
                .startTime(concert.getStartTime() != null ? concert.getStartTime().toString() : null)
                .status(concert.getStatus() != null ? concert.getStatus().name() : null)
                .availableSeats(availableSeats)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .zoneCount(zoneCount)
                .imageUrl(imageUrl)
                .build();
    }

    private ConcertStatus parseStatus(String raw) {
        try {
            return ConcertStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unknown concert status: " + raw);
        }
    }
}