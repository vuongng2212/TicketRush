package com.ticketrush.server.domain.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
    List<Order> findByUserId(UUID userId);
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
}