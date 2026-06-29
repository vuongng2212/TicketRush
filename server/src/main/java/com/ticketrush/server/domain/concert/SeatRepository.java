package com.ticketrush.server.domain.concert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, UUID> {

    @Query("SELECT s FROM Seat s JOIN SeatZone sz ON s.seatZoneId = sz.id WHERE sz.concertId = :concertId")
    List<Seat> findAllByConcertId(@Param("concertId") UUID concertId);
}
