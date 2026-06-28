package com.ticketrush.server.domain.order;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "seat_id", nullable = false)
    private UUID seatId;

    @Column(name = "ticket_code", unique = true, nullable = false)
    private String ticketCode;

    @Builder.Default
    @Column(name = "check_in_status", nullable = false)
    private Boolean checkInStatus = false;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
