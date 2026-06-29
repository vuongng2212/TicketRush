package com.ticketrush.server.infrastructure.rabbitmq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpirationMessageProducer {

    private final AmqpTemplate amqpTemplate;

    public void sendExpirationMessage(UUID orderId, long delayMillis) {
        log.info("Sending expiration message for order: {} with delay: {}ms", orderId, delayMillis);
        amqpTemplate.convertAndSend(
                RabbitMQConfig.DELAYED_EXCHANGE,
                RabbitMQConfig.EXPIRATION_ROUTING_KEY,
                orderId.toString(),
                message -> {
                    message.getMessageProperties().setDelayLong(delayMillis);
                    return message;
                }
        );
    }
}
