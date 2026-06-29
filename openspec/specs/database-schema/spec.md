# database-schema Specification

## Purpose
TBD - created by archiving change setup-infrastructure-auth. Update Purpose after archive.
## Requirements
### Requirement: JPA Domain Entities Mappings
The system SHALL define the following database entities with automatic Hibernate schema generation mapping to PostgreSQL:
- `User` (id, email, password, roles, createdAt, updatedAt)
- `Concert` (id, title, description, date, status [DRAFT, OPEN, CLOSED], createdAt, updatedAt)
- `SeatZone` (id, concertId, name, price, totalSeats, createdAt, updatedAt)
- `Seat` (id, seatZoneId, seatNumber, status [AVAILABLE, HELD, SOLD], heldByUserId, heldUntil, createdAt, updatedAt)
- `Order` (id, userId, status [PENDING_PAYMENT, COMPLETED, EXPIRED, CANCELLED], totalPrice, expiresAt, createdAt, updatedAt)
- `Ticket` (id, orderId, seatId, ticketCode, checkInStatus [FALSE, TRUE], checkInTime, createdAt, updatedAt)

#### Scenario: JPA Entity Verification
- **WHEN** the Spring Boot backend bootstraps with `spring.jpa.hibernate.ddl-auto=update`
- **THEN** it SHALL generate all tables, primary keys, and foreign keys matching the schema definitions without bootstrap errors.

