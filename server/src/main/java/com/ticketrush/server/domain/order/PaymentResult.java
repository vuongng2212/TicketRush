package com.ticketrush.server.domain.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {
    private Order order;
    private Ticket ticket;
    private String paymentReference;
    private PaymentMethod paymentMethod;
    private LocalDateTime paidAt;
    private BigDecimal totalPrice;
}