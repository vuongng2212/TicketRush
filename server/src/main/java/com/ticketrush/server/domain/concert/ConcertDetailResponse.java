package com.ticketrush.server.domain.concert;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcertDetailResponse {
    private UUID id;
    private String title;
    private String venue;
    private String startTime;
    private String status;
    private List<ZoneDetailResponse> zones;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneDetailResponse {
        private UUID id;
        private String name;
        private BigDecimal price;
        private int totalSeats;
        private List<SeatDetailResponse> seats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatDetailResponse {
        private UUID id;
        private String seatNumber;
        private String status;
        private UUID heldByUserId;
        private String heldUntil;
    }
}
