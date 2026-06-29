package com.ticketrush.server.infrastructure.rabbitmq;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String DELAYED_EXCHANGE = "ticketrush.delayed.exchange";
    public static final String EXPIRATION_QUEUE = "ticketrush.expiration.queue";
    public static final String EXPIRATION_ROUTING_KEY = "ticket.expiration";

    @Bean
    public CustomExchange delayedExchange() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-delayed-type", "direct");
        return new CustomExchange(DELAYED_EXCHANGE, "x-delayed-message", true, false, args);
    }

    @Bean
    public Queue expirationQueue() {
        return new Queue(EXPIRATION_QUEUE, true);
    }

    @Bean
    public Binding binding(Queue expirationQueue, CustomExchange delayedExchange) {
        return BindingBuilder.bind(expirationQueue)
                .to(delayedExchange)
                .with(EXPIRATION_ROUTING_KEY)
                .noargs();
    }
}
