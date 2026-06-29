## Why

Implement the core high-concurrency booking mechanism of TicketRush. Under heavy traffic (thousands of concurrent requests during a ticket release), traditional database locks cause performance degradation or deadlocks. We need an atomic memory-first lock via Redis Lua scripting to shield the primary database, paired with RabbitMQ delayed messages to clean up expired orders asynchronously.

## What Changes

- Set up a Redis connection pool in the Spring Boot backend and write a Lua script to reserve seats atomically.
- Configure RabbitMQ delayed message queues to handle ticket expirations (releasing holds after 10 minutes if unpaid).
- Implement a worker to consume delayed messages, update order status, and return seats to the available pool.
- Create multi-threaded concurrent integration tests to verify correctness and prevent double-booking.

## Capabilities

### New Capabilities
- `redis-atomic-locking`: Atomic checks and reservations of concert seats utilizing Redis Lua Scripting.
- `rabbitmq-delayed-expiration`: Ticket hold timeout handling (10-minute lease) using RabbitMQ delayed message exchange and consumer recovery logic.

### Modified Capabilities
<!-- None -->

## Impact

- **Database:** Performance is shielded by memory-first checks; writes occur only for successful locks.
- **Queue/Broker:** The RabbitMQ exchange requires the `rabbitmq_delayed_message_exchange` plugin enabled.
- **Backend:** New services for Redis scripting execution, order expiration listeners, and high-concurrency test utilities.
