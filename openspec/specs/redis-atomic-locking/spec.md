# redis-atomic-locking Specification

## Purpose
TBD - created by archiving change concurrency-seat-holding. Update Purpose after archive.
## Requirements
### Requirement: Redis Atomic Seat Lock
The system SHALL run a Redis Lua Script to execute atomic queries and updates on seat status during high-concurrency reservation events.
- Redis Set `concert:{concertId}:available` lists all available `seatId` strings.
- Redis Hash `concert:{concertId}:held` stores mappings of `seatId` to `userId` indicating temporary seat ownership.

#### Scenario: Seat lock success when seat is free
- **WHEN** a reservation request is received for a seat present in `concert:{concertId}:available`
- **THEN** the Redis script MUST remove the seat from `concert:{concertId}:available`, add the mapping `{ seatId: userId }` to `concert:{concertId}:held`, and return `1`.

#### Scenario: Seat lock failure when seat is already held
- **WHEN** a reservation request is received for a seat that is not in `concert:{concertId}:available`
- **THEN** the Redis script MUST keep all structures unchanged and return `0`.

