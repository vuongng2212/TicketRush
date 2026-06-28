## ADDED Requirements

### Requirement: Delayed Hold Messages
The system SHALL enqueue a delayed message to RabbitMQ immediately after a seat is successfully locked in Redis.
- The delayed message MUST carry the `orderId` and a delay header `x-delay` set to 10 minutes (600,000 milliseconds).

#### Scenario: Delayed message creation
- **WHEN** a temporary order is successfully created in PostgreSQL and Redis
- **THEN** the system MUST publish a message containing the `orderId` to the RabbitMQ delayed exchange.

### Requirement: Hold Expiration Processing
The system SHALL process expired order checks asynchronously upon receiving messages from the delayed queue.

#### Scenario: Order not paid within 10 minutes
- **WHEN** a delayed message is consumed and the corresponding order in PostgreSQL is still `PENDING_PAYMENT`
- **THEN** the system MUST update the order status to `EXPIRED`, release the seat status to `AVAILABLE` in PostgreSQL, execute a Redis Lua Script to restore the seat back to the available pool, and publish a real-time status update event.

#### Scenario: Order already paid within 10 minutes
- **WHEN** a delayed message is consumed and the corresponding order in PostgreSQL is `COMPLETED`
- **THEN** the system MUST discard the message and keep the seat reservation status unchanged.
