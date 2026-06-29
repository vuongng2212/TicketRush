package com.ticketrush.server.domain.concert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SeatZoneRepository extends JpaRepository<SeatZone, UUID> {
    List<SeatZone> findByConcertId(UUID concertId);
}
