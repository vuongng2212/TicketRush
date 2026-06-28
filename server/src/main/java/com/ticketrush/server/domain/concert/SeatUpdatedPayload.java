package com.ticketrush.server.domain.concert;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatUpdatedPayload {
    private UUID seatId;
    private UUID concertId;
    private String status;
    private UUID heldByUserId;
}
