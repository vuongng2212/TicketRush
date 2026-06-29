package com.ticketrush.server.infrastructure.rabbitmq;

import com.ticketrush.server.domain.order.BookingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class ExpirationMessageConsumerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private ExpirationMessageConsumer consumer;

    @Test
    void consumeExpirationMessage_processesValidOrderId() {
        UUID orderId = UUID.randomUUID();

        consumer.consumeExpirationMessage(orderId.toString());

        verify(bookingService).releaseExpiredOrder(orderId);
    }

    @Test
    void consumeExpirationMessage_invalidUuidIsSwallowed() {
        consumer.consumeExpirationMessage("not-a-uuid");

        verifyNoInteractions(bookingService);
    }

    @Test
    void consumeExpirationMessage_bookingServiceExceptionIsSwallowed() {
        UUID orderId = UUID.randomUUID();
        doThrow(new RuntimeException("boom")).when(bookingService).releaseExpiredOrder(any(UUID.class));

        consumer.consumeExpirationMessage(orderId.toString());

        verify(bookingService).releaseExpiredOrder(orderId);
    }
}
