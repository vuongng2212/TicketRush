package com.ticketrush.server.infrastructure.graphql;

import com.ticketrush.server.domain.concert.SeatUpdatedPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Component
@Slf4j
public class SeatEventPublisher {

    private final Sinks.Many<SeatUpdatedPayload> sink;

    public SeatEventPublisher() {
        // Multicast allows multiple subscribers to receive events from a single publisher.
        // onBackpressureBuffer queues items if a consumer is slow.
        this.sink = Sinks.many().multicast().onBackpressureBuffer();
    }

    public void publish(SeatUpdatedPayload event) {
        log.debug("Publishing seat event: {}", event);
        Sinks.EmitResult result = sink.tryEmitNext(event);
        if (result.isFailure()) {
            log.error("Failed to emit seat update event: {}, error: {}", event, result);
        }
    }

    public Flux<SeatUpdatedPayload> getEventStream() {
        return sink.asFlux();
    }
}
