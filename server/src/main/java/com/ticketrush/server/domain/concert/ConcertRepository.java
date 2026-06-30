package com.ticketrush.server.domain.concert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConcertRepository extends JpaRepository<Concert, UUID> {

    /**
     * Returns all concerts ordered by start time ascending.
     */
    List<Concert> findAllByOrderByStartTimeAsc();

    /**
     * Returns concerts with the given status ordered by start time ascending.
     *
     * @param status concert status to filter by
     * @return filtered list of concerts
     */
    List<Concert> findByStatusOrderByStartTimeAsc(ConcertStatus status);

    /**
     * Returns up to 8 concerts with the given status ordered by start time ascending.
     * Used by the featured-concerts carousel.
     *
     * @param status concert status to filter by
     * @return at most 8 concerts
     */
    List<Concert> findTop8ByStatusOrderByStartTimeAsc(ConcertStatus status);
}