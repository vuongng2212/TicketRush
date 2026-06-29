package com.ticketrush.server.infrastructure.rabbitmq;

import com.ticketrush.server.domain.order.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpirationMessageConsumer {

    private final BookingService bookingService;

    @RabbitListener(queues = RabbitMQConfig.EXPIRATION_QUEUE)
    public void consumeExpirationMessage(String orderIdStr) {
        log.info("Received expiration message for order: {}", orderIdStr);
        try {
            UUID orderId = UUID.fromString(orderIdStr);
            bookingService.releaseExpiredOrder(orderId);
        } catch (Exception e) {
            log.error("Failed to process expiration message for order: {}", orderIdStr, e);
        }
    }
}
