local avail_key = KEYS[1]
local held_key = KEYS[2]
local seat_id = ARGV[1]
local user_id = ARGV[2]

local is_avail = redis.call('SISMEMBER', avail_key, seat_id)
if is_avail == 1 then
    redis.call('SREM', avail_key, seat_id)
    redis.call('HSET', held_key, seat_id, user_id)
    return 1
else
    return 0
end
