package com.ticketrush.server.infrastructure.seeding;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Seeds the database with 8 Vietnamese concerts on first startup.
 * Delegates the actual seeding to {@link ConcertSeederService} so that
 * the @Transactional method is called through Spring's AOP proxy.
 */
@Component
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final ConcertSeederService seederService;

    public DatabaseSeeder(ConcertSeederService seederService) {
        this.seederService = seederService;
    }

    /**
     * Static seed data for the 8 Vietnamese concerts exposed by the frontend.
     * Concert UUIDs are fixed so the frontend (and any test suites) can reference
     * them deterministically. The first concert keeps the original UUID
     * (00000000-0000-0000-0000-000000000001) for backward compatibility.
     */
    private static final List<ConcertSeedData> SEED_CONCERTS = List.of(
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000001"),
                    "BlackPink World Tour",
                    "My Dinh National Stadium",
                    30,
                    new BigDecimal("1500000"),
                    new BigDecimal("2500000"),
                    100, 300, 200),
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000002"),
                    "Ho Tram Music Festival",
                    "Ho Tram Beach",
                    20,
                    new BigDecimal("1200000"),
                    new BigDecimal("1800000"),
                    80, 250, 200),
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000003"),
                    "Hoai Linh Comedy Show",
                    "Saigon Opera House",
                    5,
                    new BigDecimal("500000"),
                    new BigDecimal("800000"),
                    50, 200, 150),
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000004"),
                    "Son Tung M-TP Sky Tour",
                    "Hanoi Indoor Games Gymnasium",
                    43,
                    new BigDecimal("2000000"),
                    new BigDecimal("3200000"),
                    200, 500, 300),
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000005"),
                    "Vietnam vs Thailand",
                    "Thong Nhat Stadium",
                    58,
                    new BigDecimal("200000"),
                    new BigDecimal("500000"),
                    50, 250, 200),
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000006"),
                    "Monsoon Music Festival",
                    "Hanoi Opera House",
                    78,
                    new BigDecimal("900000"),
                    new BigDecimal("1500000"),
                    120, 400, 250),
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000007"),
                    "Den Vau Live in Saigon",
                    "The Reverie Saigon",
                    18,
                    new BigDecimal("800000"),
                    new BigDecimal("1200000"),
                    80, 250, 200),
            new ConcertSeedData(
                    UUID.fromString("00000000-0000-0000-0000-000000000008"),
                    "Hoa Minzy Solo Concert",
                    "Phu Tho Stadium",
                    71,
                    new BigDecimal("600000"),
                    new BigDecimal("950000"),
                    60, 200, 150));

    @Override
    public void run(String... args) {
        log.info("DatabaseSeeder starting...");

        int totalSeats = 0;
        int totalZones = 0;
        int failed = 0;

        for (ConcertSeedData data : SEED_CONCERTS) {
            log.info("Seeding concert: {} ({})", data.title(), data.id());

            int concertSeats = 0;
            try {
                concertSeats = seederService.seedConcert(
                        data.id(),
                        data.title(),
                        data.venue(),
                        data.daysFromNow(),
                        data.minPrice(),
                        data.maxPrice(),
                        data.vipSeats(),
                        data.standardSeats(),
                        data.economySeats());
            } catch (Exception e) {
                log.error("Failed to seed concert '{}': {}", data.title(), e.getMessage());
                failed++;
                continue;
            }

            if (concertSeats > 0) {
                totalSeats += concertSeats;
                totalZones += 3;
                log.info("  ✓ Seeded {} with 3 zones and {} seats", data.title(), concertSeats);
            } else {
                log.info("  → Skipped {} (already exists or failed)", data.title());
            }
        }

        log.info("DatabaseSeeder finished: {} concerts in spec, {} succeeded, {} failed, "
                        + "{} new zones, {} new seats",
                SEED_CONCERTS.size(), SEED_CONCERTS.size() - failed, failed,
                totalZones, totalSeats);
    }

    /**
     * Immutable seed spec for one concert.
     */
    private record ConcertSeedData(
            UUID id,
            String title,
            String venue,
            int daysFromNow,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int vipSeats,
            int standardSeats,
            int economySeats) {}
}
