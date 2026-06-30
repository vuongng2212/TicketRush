package com.ticketrush.server.infrastructure.seeding;

import com.ticketrush.server.domain.concert.*;
import com.ticketrush.server.infrastructure.redis.RedisReservationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service responsible for seeding a single concert with its zones and seats.
 * Extracted to a separate Spring bean so that @Transactional works correctly
 * (the AOP proxy is engaged when called from a different bean).
 *
 * Uses repository.save() with manually-assigned UUIDs. This works because
 * each method invocation gets its own @Transactional context, and the entity
 * is freshly created (not attached to any prior persistence context).
 */
@Service
@Slf4j
public class ConcertSeederService {

    private final ConcertRepository concertRepository;
    private final SeatZoneRepository seatZoneRepository;
    private final SeatRepository seatRepository;
    private final RedisReservationService redisReservationService;

    public ConcertSeederService(
            ConcertRepository concertRepository,
            SeatZoneRepository seatZoneRepository,
            SeatRepository seatRepository,
            RedisReservationService redisReservationService) {
        this.concertRepository = concertRepository;
        this.seatZoneRepository = seatZoneRepository;
        this.seatRepository = seatRepository;
        this.redisReservationService = redisReservationService;
    }

    /**
     * Seed a single concert with 3 zones (VIP, Standard, Economy) and the requested
     * number of seats per zone. Each call is its own transaction. Returns the number
     * of seats actually persisted.
     */
    @Transactional
    public int seedConcert(
            UUID id,
            String title,
            String venue,
            int daysFromNow,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int vipSeats,
            int standardSeats,
            int economySeats) {

        // 1. Concert entity
        if (concertRepository.existsById(id)) {
            log.info("Concert '{}' already exists, skipping", title);
            return 0;
        }
        try {
            Concert concert = Concert.builder()
                    .id(id)
                    .title(title)
                    .description(title + " — seeded by DatabaseSeeder")
                    .startTime(LocalDateTime.now().plusDays(daysFromNow))
                    .venue(venue)
                    .status(ConcertStatus.OPEN)
                    .build();
            concertRepository.saveAndFlush(concert);
        } catch (Exception e) {
            log.warn("Seed conflict on concert '{}': {}", title, e.getMessage());
            return 0;
        }

        // 2. Zones: VIP = maxPrice, Standard = midpoint, Economy = minPrice
        BigDecimal standardPrice = minPrice.add(maxPrice)
                .divide(BigDecimal.valueOf(2), 0, RoundingMode.HALF_UP);

        UUID vipZoneId = UUID.randomUUID();
        UUID standardZoneId = UUID.randomUUID();
        UUID economyZoneId = UUID.randomUUID();

        SeatZone vipZone = SeatZone.builder()
                .id(vipZoneId)
                .concertId(id)
                .name("VIP")
                .price(maxPrice)
                .totalSeats(vipSeats)
                .build();

        SeatZone standardZone = SeatZone.builder()
                .id(standardZoneId)
                .concertId(id)
                .name("Standard")
                .price(standardPrice)
                .totalSeats(standardSeats)
                .build();

        SeatZone economyZone = SeatZone.builder()
                .id(economyZoneId)
                .concertId(id)
                .name("Economy")
                .price(minPrice)
                .totalSeats(economySeats)
                .build();

        try {
            seatZoneRepository.saveAndFlush(vipZone);
        } catch (Exception e) {
            log.warn("Seed conflict on VIP zone for '{}': {}", title, e.getMessage());
        }
        try {
            seatZoneRepository.saveAndFlush(standardZone);
        } catch (Exception e) {
            log.warn("Seed conflict on Standard zone for '{}': {}", title, e.getMessage());
        }
        try {
            seatZoneRepository.saveAndFlush(economyZone);
        } catch (Exception e) {
            log.warn("Seed conflict on Economy zone for '{}': {}", title, e.getMessage());
        }

        // 3. Seats
        List<Seat> seats = generateSeats(
                vipZoneId, standardZoneId, economyZoneId,
                vipSeats, standardSeats, economySeats);

        try {
            List<Seat> savedSeats = seatRepository.saveAll(seats);
            seatRepository.flush();

            // 4. CRITICAL: Initialize Redis "available" set for this concert
            List<UUID> seatIds = savedSeats.stream().map(Seat::getId).toList();
            redisReservationService.initializeSeats(id, seatIds);

            return savedSeats.size();
        } catch (Exception e) {
            log.warn("Seed conflict on seats for '{}': {}", title, e.getMessage());
            return 0;
        }
    }

    /**
     * Build the seat rows for the three zones. Seat numbers are prefixed by zone.
     */
    private List<Seat> generateSeats(
            UUID vipZoneId,
            UUID standardZoneId,
            UUID economyZoneId,
            int vipCount,
            int standardCount,
            int economyCount) {

        List<Seat> seats = new ArrayList<>(vipCount + standardCount + economyCount);

        for (int i = 1; i <= vipCount; i++) {
            seats.add(Seat.builder()
                    .seatZoneId(vipZoneId)
                    .seatNumber("VIP-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
        for (int i = 1; i <= standardCount; i++) {
            seats.add(Seat.builder()
                    .seatZoneId(standardZoneId)
                    .seatNumber("STD-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
        for (int i = 1; i <= economyCount; i++) {
            seats.add(Seat.builder()
                    .seatZoneId(economyZoneId)
                    .seatNumber("ECO-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        return seats;
    }
}
