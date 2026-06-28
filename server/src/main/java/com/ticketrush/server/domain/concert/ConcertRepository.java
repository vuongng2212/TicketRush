package com.ticketrush.server.domain.concert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConcertRepository extends JpaRepository<Concert, UUID> {
}
