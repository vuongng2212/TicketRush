## Context

We are implementing Sprint 2 for TicketRush, focused on concurrency mitigation and holding engine stability. The current state is that Spring Boot JPA entities exist, and basic PostgreSQL, Redis, and RabbitMQ containers are running. We must now bind Redis and RabbitMQ configuration rules to support locking and delayed expiration processing.

## Goals / Non-Goals

**Goals:**
- Implement Redis Lua scripting for atomic checking and locking of concert seats.
- Configure RabbitMQ delayed message exchange (`x-delayed-message` plugin) to schedule hold timeouts.
- Create asynchronous message listeners to unlock expired seats in Redis and JPA PostgreSQL.
- Verify consistency under a concurrent test pipeline.

**Non-Goals:**
- Implementing the Next.js frontend UI for the seat map.
- Setting up the GraphQL subscription mapping for realtime WebSocket sync (Sprint 3).

## Decisions

### 1. Redis Client Configuration (Jedis vs. Lettuce)
- **Decision:** Use **Lettuce** (Spring Boot's default) with a configured connection pool (`commons-pool2`).
- **Rationale:** Lettuce is thread-safe and supports reactive/asynchronous executions naturally.

### 2. Redis Lua Script Execution
- **Decision:** Execute reservation scripts natively through Spring's `StringRedisTemplate.execute(RedisScript, KEYS, ARGV)`.
- **Alternatives Considered:** 
  - *Distributed lock (Redisson):* High network overhead (multiple roundtrips for lock acquisition, release, renewal). Lua scripts complete atomically in a single roundtrip, preventing race conditions entirely on single-instance Redis keys.

### 3. Expiration Tracking (MQ vs. Schedulers)
- **Decision:** RabbitMQ Delayed Message Exchange (`x-delayed-message`).
- **Rationale:** Traditional database polling (e.g., `@Scheduled` running every minute) queries the DB constantly, adding load. RabbitMQ handles timing state in-memory/on-disk and fires events directly to a consumer exactly 10 minutes later.

## Risks / Trade-offs

- **[Risk] Redis & DB Desynchronization:** If the Lua script executes but PostgreSQL transaction fails, the seat status will mismatch.
  - *Mitigation:* Wrap DB insertion and Redis script execution in a cohesive transactional pipeline. If PostgreSQL fails, trigger an compensating rollback on Redis.
- **[Risk] High memory footprint in Redis:** Soring millions of available seats can consume significant memory.
  - *Mitigation:* Store only seat identifiers (`UUID`) as simple strings inside a Redis Set. Clean up structures once a concert is closed.
