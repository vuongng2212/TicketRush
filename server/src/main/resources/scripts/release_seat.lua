local avail_key = KEYS[1]
local held_key = KEYS[2]
local seat_id = ARGV[1]

local is_held = redis.call('HEXISTS', held_key, seat_id)
if is_held == 1 then
    redis.call('HDEL', held_key, seat_id)
    redis.call('SADD', avail_key, seat_id)
    return 1
else
    return 0
end
