package com.ticketrush.server.domain.concert;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Lightweight projection of a concert for list/carousel views.
 * Aggregates summary statistics (available seats, price range, zone count)
 * so the client doesn't need to fetch full seat details for each card.
 * <p>
 * The {@code city}, {@code artist}, and {@code ticketStatus} fields power
 * the Editorial Music Discovery UI groupings (by city, headline artist,
 * and sales-state badge).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcertSummaryResponse {
    private UUID id;
    private String title;
    private String description;
    private String venue;
    private String startTime;
    private String status;
    private int availableSeats;
    private double minPrice;
    private double maxPrice;
    private int zoneCount;
    private String imageUrl;
    private String city;
    private String artist;
    private TicketStatus ticketStatus;
}
