package com.ticketrush.server.infrastructure.seeding;

import com.ticketrush.server.domain.concert.*;
import com.ticketrush.server.infrastructure.redis.RedisReservationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
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


        Concert concert = Concert.builder()
                .id(id)
                .title(title)
                .description(title + " — seeded by DatabaseSeeder")
                .startTime(LocalDateTime.now().plusDays(daysFromNow))
                .venue(venue)
                .status(ConcertStatus.OPEN)
                .build();
        concertRepository.save(concert);
        concertRepository.flush();

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

        seatZoneRepository.save(vipZone);
        seatZoneRepository.save(standardZone);
        seatZoneRepository.save(economyZone);

        // 3. Seats
        List<Seat> seats = generateSeats(
                vipZoneId, standardZoneId, economyZoneId,
                vipSeats, standardSeats, economySeats);

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        seatRepository.flush();

        // 4. CRITICAL: Initialize Redis "available" set for this concert
        List<UUID> seatIds = savedSeats.stream().map(Seat::getId).toList();
        redisReservationService.initializeSeats(id, seatIds);

        return savedSeats.size();
    }

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
                    .id(UUID.randomUUID())
                    .seatNumber("VIP-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
        for (int i = 1; i <= standardCount; i++) {
            seats.add(Seat.builder()
                    .seatZoneId(standardZoneId)
                    .id(UUID.randomUUID())
                    .seatNumber("STD-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
        for (int i = 1; i <= economyCount; i++) {
            seats.add(Seat.builder()
                    .seatZoneId(economyZoneId)
                    .id(UUID.randomUUID())
                    .seatNumber("ECO-" + i)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        return seats;
    }
}
