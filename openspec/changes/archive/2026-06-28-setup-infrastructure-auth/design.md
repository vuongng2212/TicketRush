## Context

We are starting the implementation of Sprint 1 for TicketRush, a high-throughput ticketing platform. The current state is a skeleton Spring Boot application (using Maven and Java 21) and a basic Next.js frontend directory, neither of which are connected to database or queue brokers. This design document establishes the concrete configuration of Docker services and the security and API pattern choices to ensure a robust foundation.

## Goals / Non-Goals

**Goals:**
- Delineate the exact JPA configurations and relationships.
- Establish a secure JWT authentication mechanism via GraphQL mutations.
- Secure GraphQL endpoints using a custom Spring Security configuration.
- Define a scalable project package hierarchy adhering to Domain-Driven Design (DDD) principles.

**Non-Goals:**
- Implementing the high-throughput Redis Lua holding mechanism (Sprint 2 scope).
- Setting up GraphQL subscriptions over WebSocket transport (Sprint 3 scope).
- Setting up the Web client login screens or UI elements (Sprint 3 scope).

## Decisions

### 1. Database Connection and Schema Management
- **Decision:** Use Spring Data JPA with PostgreSQL. Set `spring.jpa.hibernate.ddl-auto=update` for local development.
- **Alternatives Considered:** 
  - *Flyway/Liquibase Migrations:* Ideal for production but adds friction during the rapid prototyping phase of Sprint 1. We will transition to migrations prior to Sprint 4 load tests.
  - *NoSQL (MongoDB):* Not suitable since ticketing requires strict transactional isolation (ACID) and strong entity relationships.
- **DDD Directory Structure:**
  - `com.ticketrush.server.domain.user` (User, UserRepository, UserService)
  - `com.ticketrush.server.domain.concert` (Concert, SeatZone, Seat, ConcertRepository...)
  - `com.ticketrush.server.domain.order` (Order, Ticket, OrderRepository...)
  - `com.ticketrush.server.infrastructure` (Security, MQ, Redis configurations)

### 2. Authentication Protocol & Spring Security
- **Decision:** Stateles JWT token verification. Authenticated queries/mutations will extract JWT from the `Authorization: Bearer <token>` header.
- **Details:** 
  - Integrate a custom JWT filter (`JwtAuthenticationFilter`) inside Spring Security filter chain.
  - BCryptPasswordEncoder for password hashing.
  - Token payload contains: `sub` (user email), `userId`, `roles`, and expiry (24 hours).
- **Alternatives Considered:**
  - *Spring Security Session-based auth:* Statefulness limits horizontal scaling, which is a core requirement for high-throughput booking servers.

### 3. GraphQL Schema Structure (Schema-First)
- **Decision:** Expose mutations `/register` and `/login` return a payload containing the token and user info.
- **Alternative Considered:** REST for Auth, GraphQL for others. Keeping everything on GraphQL maintains single endpoint consistency (`/graphql`).

## Risks / Trade-offs

- **[Risk] Hibernate Auto-DDL Inaccuracies:** Auto-generated tables may miss custom indexes or specific column data sizes.
  - *Mitigation:* Explicitly declare `@Column` size limits, unique constraints (e.g. `@Column(unique = true)` on Email), and indexes in code annotations.
- **[Risk] Spring Security + GraphQL Error Handling:** Security exceptions thrown in custom filters can result in raw servlet errors instead of clean GraphQL formatting.
  - *Mitigation:* Build a custom GraphQL exception resolver (`DataFetcherExceptionResolverAdapter`) to map Spring Security/Auth errors to clean GraphQL error objects.
