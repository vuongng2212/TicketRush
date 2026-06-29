package com.ticketrush.server.infrastructure.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RedisReservationService {

    private final StringRedisTemplate redisTemplate;

    private static final RedisScript<Long> HOLD_SCRIPT = new DefaultRedisScript<>(
            "local avail_key = KEYS[1] " +
            "local held_key = KEYS[2] " +
            "local seat_id = ARGV[1] " +
            "local user_id = ARGV[2] " +
            "local is_avail = redis.call('SISMEMBER', avail_key, seat_id) " +
            "if is_avail == 1 then " +
            "    redis.call('SREM', avail_key, seat_id) " +
            "    redis.call('HSET', held_key, seat_id, user_id) " +
            "    return 1 " +
            "else " +
            "    return 0 " +
            "end",
            Long.class
    );

    private static final RedisScript<Long> RELEASE_SCRIPT = new DefaultRedisScript<>(
            "local avail_key = KEYS[1] " +
            "local held_key = KEYS[2] " +
            "local seat_id = ARGV[1] " +
            "local is_held = redis.call('HEXISTS', held_key, seat_id) " +
            "if is_held == 1 then " +
            "    redis.call('HDEL', held_key, seat_id) " +
            "    redis.call('SADD', avail_key, seat_id) " +
            "    return 1 " +
            "else " +
            "    return 0 " +
            "end",
            Long.class
    );

    public void initializeSeats(UUID concertId, List<UUID> seatIds) {
        String availKey = getAvailableKey(concertId);
        redisTemplate.delete(availKey);
        redisTemplate.delete(getHeldKey(concertId));

        if (!seatIds.isEmpty()) {
            String[] ids = seatIds.stream().map(UUID::toString).toArray(String[]::new);
            redisTemplate.opsForSet().add(availKey, ids);
        }
    }

    public boolean holdSeat(UUID concertId, UUID seatId, UUID userId) {
        String availKey = getAvailableKey(concertId);
        String heldKey = getHeldKey(concertId);
        
        Long result = redisTemplate.execute(
                HOLD_SCRIPT,
                List.of(availKey, heldKey),
                seatId.toString(),
                userId.toString()
        );
        return result != null && result == 1;
    }

    public boolean releaseSeat(UUID concertId, UUID seatId) {
        String availKey = getAvailableKey(concertId);
        String heldKey = getHeldKey(concertId);

        Long result = redisTemplate.execute(
                RELEASE_SCRIPT,
                List.of(availKey, heldKey),
                seatId.toString()
        );
        return result != null && result == 1;
    }

    private String getAvailableKey(UUID concertId) {
        return "concert:" + concertId + ":available";
    }

    private String getHeldKey(UUID concertId) {
        return "concert:" + concertId + ":held";
    }
}
