package com.ticketrush.server.infrastructure.seeding;

import com.ticketrush.server.domain.concert.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final ConcertRepository concertRepository;
    private final SeatZoneRepository seatZoneRepository;
    private final SeatRepository seatRepository;

    public DatabaseSeeder(
            ConcertRepository concertRepository,
            SeatZoneRepository seatZoneRepository,
            SeatRepository seatRepository) {
        this.concertRepository = concertRepository;
        this.seatZoneRepository = seatZoneRepository;
        this.seatRepository = seatRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        UUID concertId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        
        // Remove @Transactional from run() so we can handle conflicts gracefully
        // without marking the entire container startup transaction as rollback-only.
        if (concertRepository.existsById(concertId)) {
            System.out.println(">>> Database already seeded. Skipping seeder run.");
            return;
        }

        // 1. Create a Default Concert with Fixed UUID: 00000000-0000-0000-0000-000000000001
        Concert concert = Concert.builder()
                .id(concertId)
                .title("TicketRush Live Concert")
                .description("Exclusive high-concurrency ticket release load test event")
                .startTime(LocalDateTime.now().plusDays(30))
                .venue("My Dinh National Stadium")
                .status(ConcertStatus.OPEN)
                .build();
        
        try {
            concertRepository.save(concert);
        } catch (Exception e) {
            System.out.println(">>> Seed conflict caught, concert already exists: " + e.getMessage());
            return;
        }

        // 2. Create VIP Zone
        UUID vipZoneId = UUID.fromString("00000000-0000-0000-0000-000000000010");
        SeatZone vipZone = SeatZone.builder()
                .id(vipZoneId)
                .concertId(concertId)
                .name("VIP Zone")
                .price(new BigDecimal("500.00"))
                .totalSeats(500)
                .build();
        try {
            seatZoneRepository.save(vipZone);
        } catch (Exception e) {
            System.out.println(">>> Seed conflict VIP zone: " + e.getMessage());
        }

        // 3. Create Standard Zone
        UUID standardZoneId = UUID.fromString("00000000-0000-0000-0000-000000000020");
        SeatZone standardZone = SeatZone.builder()
                .id(standardZoneId)
                .concertId(concertId)
                .name("Standard Zone")
                .price(new BigDecimal("150.00"))
                .totalSeats(1500)
                .build();
        try {
            seatZoneRepository.save(standardZone);
        } catch (Exception e) {
            System.out.println(">>> Seed conflict Standard zone: " + e.getMessage());
        }

        // 4. Create seats for VIP Zone (e.g. VIP-1 to VIP-500)
        List<Seat> seats = new ArrayList<>();
        for (int i = 1; i <= 500; i++) {
            seats.add(Seat.builder()
                    .seatZoneId(vipZoneId)
                    .seatNumber("VIP-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        // 5. Create seats for Standard Zone (e.g. STD-1 to STD-1500)
        for (int i = 1; i <= 1500; i++) {
            seats.add(Seat.builder()
                    .seatZoneId(standardZoneId)
                    .seatNumber("STD-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        try {
            seatRepository.saveAll(seats);
            System.out.println(">>> Database Seeded successfully with 2,000 seats!");
        } catch (Exception e) {
            System.out.println(">>> Seed conflict seats: " + e.getMessage());
        }
    }
}
