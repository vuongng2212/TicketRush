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

    // Schema uses raw UUID FKs (no JPA relations). JPA constructor expression
    // doesn't support cross-entity joins cleanly, so we look up the joined fields
    // in MyOrdersGraphQLController after fetching tickets. Keeping a simple
    // findByOrderId-style query here is enough.
    List<Ticket> findByOrderIdOrderByCreatedAtAsc(UUID orderId);
}
