package com.ticketrush.server.domain.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyTicketDetail {
    private UUID id;
    private String ticketCode;
    private String concertTitle;
    private String venue;
    private LocalDateTime startTime;
    private String seatNumber;
    private String zoneName;
    private BigDecimal price;
    private LocalDateTime purchasedAt;
}
