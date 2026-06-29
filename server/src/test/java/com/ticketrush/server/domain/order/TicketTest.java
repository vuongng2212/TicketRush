package com.ticketrush.server.domain.order;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TicketTest {

    @Test
    void builderSetsAllFields() {
        UUID id = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Ticket ticket = Ticket.builder()
                .id(id)
                .orderId(orderId)
                .seatId(seatId)
                .ticketCode("TICKET-001")
                .checkInStatus(true)
                .checkInTime(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(ticket.getId()).isEqualTo(id);
        assertThat(ticket.getOrderId()).isEqualTo(orderId);
        assertThat(ticket.getSeatId()).isEqualTo(seatId);
        assertThat(ticket.getTicketCode()).isEqualTo("TICKET-001");
        assertThat(ticket.getCheckInStatus()).isTrue();
        assertThat(ticket.getCheckInTime()).isEqualTo(now);
        assertThat(ticket.getCreatedAt()).isEqualTo(now);
        assertThat(ticket.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    void noArgsConstructorYieldsDefaults() {
        Ticket ticket = new Ticket();
        assertThat(ticket.getId()).isNull();
        assertThat(ticket.getOrderId()).isNull();
        assertThat(ticket.getSeatId()).isNull();
        assertThat(ticket.getTicketCode()).isNull();
        assertThat(ticket.getCheckInStatus()).isFalse();
        assertThat(ticket.getCheckInTime()).isNull();
        assertThat(ticket.getCreatedAt()).isNull();
        assertThat(ticket.getUpdatedAt()).isNull();
    }

    @Test
    void allArgsConstructor() {
        UUID id = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        LocalDateTime checkInTime = LocalDateTime.of(2030, 1, 1, 12, 0);
        LocalDateTime createdAt = LocalDateTime.of(2029, 12, 31, 10, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2030, 1, 2, 10, 0);

        Ticket ticket = new Ticket(id, orderId, seatId, "TKT-X", true, checkInTime, createdAt, updatedAt);

        assertThat(ticket.getId()).isEqualTo(id);
        assertThat(ticket.getOrderId()).isEqualTo(orderId);
        assertThat(ticket.getSeatId()).isEqualTo(seatId);
        assertThat(ticket.getTicketCode()).isEqualTo("TKT-X");
        assertThat(ticket.getCheckInStatus()).isTrue();
        assertThat(ticket.getCheckInTime()).isEqualTo(checkInTime);
        assertThat(ticket.getCreatedAt()).isEqualTo(createdAt);
        assertThat(ticket.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void settersUpdateState() {
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID());
        ticket.setOrderId(UUID.randomUUID());
        ticket.setSeatId(UUID.randomUUID());
        ticket.setTicketCode("T-1");
        ticket.setCheckInStatus(true);
        ticket.setCheckInTime(LocalDateTime.now());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        assertThat(ticket.getId()).isNotNull();
        assertThat(ticket.getOrderId()).isNotNull();
        assertThat(ticket.getSeatId()).isNotNull();
        assertThat(ticket.getTicketCode()).isEqualTo("T-1");
        assertThat(ticket.getCheckInStatus()).isTrue();
        assertThat(ticket.getCheckInTime()).isNotNull();
        assertThat(ticket.getCreatedAt()).isNotNull();
        assertThat(ticket.getUpdatedAt()).isNotNull();
    }

    @Test
    void builderDefaultCheckInStatusIsFalse() {
        Ticket ticket = Ticket.builder()
                .orderId(UUID.randomUUID())
                .seatId(UUID.randomUUID())
                .ticketCode("T-2")
                .build();

        assertThat(ticket.getCheckInStatus()).isFalse();
    }

    @Test
    void equalsAndHashCode() {
        UUID id = UUID.randomUUID();
        Ticket t1 = Ticket.builder().id(id).ticketCode("T-3").build();
        Ticket t2 = Ticket.builder().id(id).ticketCode("T-3").build();
        Ticket t3 = Ticket.builder().id(UUID.randomUUID()).ticketCode("T-3").build();

        assertThat(t1).isEqualTo(t2);
        assertThat(t1.hashCode()).isEqualTo(t2.hashCode());
        assertThat(t1).isNotEqualTo(t3);
    }

    @Test
    void toStringIncludesCode() {
        Ticket ticket = Ticket.builder().ticketCode("T-4").build();
        assertThat(ticket.toString()).contains("T-4");
    }
}
