package com.ticketrush.server.infrastructure.graphql;

import com.ticketrush.server.domain.concert.SeatUpdatedPayload;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SeatEventPublisherTest {

    @Test
    void publishAndStreamRoundTrip() {
        SeatEventPublisher publisher = new SeatEventPublisher();
        UUID concertId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        SeatUpdatedPayload payload = SeatUpdatedPayload.builder()
                .concertId(concertId)
                .seatId(seatId)
                .status("HELD")
                .heldByUserId(UUID.randomUUID())
                .build();

        publisher.publish(payload);

        SeatUpdatedPayload received = publisher.getEventStream().blockFirst();
        assertThat(received).isNotNull();
        assertThat(received.getConcertId()).isEqualTo(concertId);
        assertThat(received.getSeatId()).isEqualTo(seatId);
        assertThat(received.getStatus()).isEqualTo("HELD");
    }

    @Test
    void streamReplaysEventsToNewSubscribers() {
        SeatEventPublisher publisher = new SeatEventPublisher();
        SeatUpdatedPayload payload = SeatUpdatedPayload.builder()
                .concertId(UUID.randomUUID())
                .seatId(UUID.randomUUID())
                .status("AVAILABLE")
                .build();

        publisher.publish(payload);

        SeatUpdatedPayload a = publisher.getEventStream().blockFirst();
        assertThat(a).isNotNull();
        assertThat(a.getStatus()).isEqualTo("AVAILABLE");
    }
}
