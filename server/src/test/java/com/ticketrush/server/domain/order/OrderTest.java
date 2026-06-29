package com.ticketrush.server.domain.order;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class OrderTest {

    @Test
    void builderAndAccessors() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LocalDateTime expires = LocalDateTime.of(2030, 1, 1, 12, 0);
        LocalDateTime now = LocalDateTime.now();

        Order order = Order.builder()
                .id(id)
                .userId(userId)
                .status(OrderStatus.PENDING_PAYMENT)
                .totalPrice(new BigDecimal("100.00"))
                .expiresAt(expires)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(order.getId()).isEqualTo(id);
        assertThat(order.getUserId()).isEqualTo(userId);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(order.getTotalPrice()).isEqualByComparingTo("100.00");
        assertThat(order.getExpiresAt()).isEqualTo(expires);
    }

    @Test
    void noArgsConstructor() {
        Order order = new Order();
        assertThat(order.getStatus()).isNull();
        assertThat(order.getTotalPrice()).isNull();
    }

    @Test
    void settersUpdateState() {
        Order order = new Order();
        order.setStatus(OrderStatus.EXPIRED);
        order.setTotalPrice(new BigDecimal("50.00"));

        assertThat(order.getStatus()).isEqualTo(OrderStatus.EXPIRED);
        assertThat(order.getTotalPrice()).isEqualByComparingTo("50.00");
    }

    @Test
    void allArgsConstructor() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LocalDateTime expires = LocalDateTime.of(2030, 1, 1, 12, 0);
        Order order = new Order(id, userId, OrderStatus.COMPLETED, new BigDecimal("10.00"), expires, null, null);
        assertThat(order.getId()).isEqualTo(id);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.COMPLETED);
    }
}
