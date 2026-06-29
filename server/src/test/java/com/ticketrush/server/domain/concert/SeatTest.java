package com.ticketrush.server.domain.concert;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SeatTest {

    @Test
    void builderAndAccessors() {
        UUID id = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Seat seat = Seat.builder()
                .id(id)
                .seatZoneId(zoneId)
                .seatNumber("A-1")
                .status(SeatStatus.HELD)
                .heldByUserId(userId)
                .heldUntil(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(seat.getId()).isEqualTo(id);
        assertThat(seat.getSeatZoneId()).isEqualTo(zoneId);
        assertThat(seat.getSeatNumber()).isEqualTo("A-1");
        assertThat(seat.getStatus()).isEqualTo(SeatStatus.HELD);
        assertThat(seat.getHeldByUserId()).isEqualTo(userId);
        assertThat(seat.getHeldUntil()).isEqualTo(now);
    }

    @Test
    void noArgsConstructor() {
        Seat seat = new Seat();
        assertThat(seat.getStatus()).isNull();
        assertThat(seat.getSeatNumber()).isNull();
    }

    @Test
    void setters() {
        Seat seat = new Seat();
        seat.setStatus(SeatStatus.SOLD);
        seat.setHeldByUserId(UUID.randomUUID());
        seat.setHeldUntil(LocalDateTime.now());

        assertThat(seat.getStatus()).isEqualTo(SeatStatus.SOLD);
        assertThat(seat.getHeldByUserId()).isNotNull();
        assertThat(seat.getHeldUntil()).isNotNull();
    }

    @Test
    void allArgsConstructor() {
        UUID id = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        Seat seat = new Seat(id, zoneId, "VIP-1", SeatStatus.AVAILABLE, null, null, null, null);
        assertThat(seat.getId()).isEqualTo(id);
        assertThat(seat.getSeatNumber()).isEqualTo("VIP-1");
    }
}
