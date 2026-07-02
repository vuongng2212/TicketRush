package com.ticketrush.server.domain.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByOrderId(UUID orderId);
    Optional<Ticket> findByTicketCode(String ticketCode);

    @Query("""
        SELECT t FROM Ticket t
        JOIN Order o ON t.orderId = o.id
        WHERE o.userId = :userId
        """)
    List<Ticket> findByUserId(@Param("userId") UUID userId);

    // Fixed: schema uses raw UUID FKs (no JPA relations), so we join via subqueries
    // against the Seat, SeatZone, Concert tables using the FK columns directly.
    @Query(value = """
        SELECT new com.ticketrush.server.domain.order.MyTicketDetail(
            t.id, t.ticketCode,
            c.title, c.venue,
            CAST(c.startTime AS string),
            sz.name, s.seatNumber, sz.price, o.status, o.id)
        FROM Ticket t, Order o, Seat s, SeatZone sz, Concert c
        WHERE t.orderId = o.id
          AND t.seatId = s.id
          AND s.seatZoneId = sz.id
          AND sz.concertId = c.id
          AND o.id = :orderId
        """)
    List<MyTicketDetail> getTicketDetailsByOrderId(@Param("orderId") UUID orderId);
}
