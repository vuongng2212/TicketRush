## Why

Establish the core application infrastructure and domain model for TicketRush. We need to spin up the local development environment (PostgreSQL, Redis, RabbitMQ) and implement the baseline security and user authentication via GraphQL. This lays the foundation for high-concurrency booking, real-time ticket holding, and secure verification.

## What Changes

- Launch local Docker Compose services: PostgreSQL (persistent storage), Redis (high-speed atomic reservation cache), and RabbitMQ (delayed event processing).
- Configure the Spring Boot database connection and automatically generate JPA entities mapping the core database schema.
- Implement token-based authentication (JWT) secured with Spring Security for API-level client access control.
- Expose registration and login operations over a GraphQL API (Schema-First).

## Capabilities

### New Capabilities
- `infrastructure-setup`: Establish local containerized database, cache, and queue servers, including delayed message exchange support.
- `database-schema`: Core domain modeling (User, Concert, SeatZone, Seat, Order, Ticket) mapped to Postgres via Hibernate JPA.
- `graphql-user-authentication`: Secure User registration and login utilizing JWT over GraphQL schema-first queries and mutations.

### Modified Capabilities
<!-- None, this is the bootstrap phase -->

## Impact

- **Build / Dev Env:** Developers will now need Docker Compose running locally.
- **Backend:** New dependencies introduced for JWT generation, Spring Security, JPA, Reactive Redis, and RabbitMQ.
- **API Contracts:** GraphQL endpoints will now be exposed at `/graphql`.
- **Database:** Auto-generated PostgreSQL schema for TicketRush domain models.
