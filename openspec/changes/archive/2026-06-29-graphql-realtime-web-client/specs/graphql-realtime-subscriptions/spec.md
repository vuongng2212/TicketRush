## ADDED Requirements

### Requirement: GraphQL Subscription Endpoint
The backend system SHALL expose a GraphQL Subscription endpoint via WebSocket transport at `/graphql` path to broadcast seat updates.

#### Scenario: Connecting to GraphQL Subscription
- **WHEN** client initiates a WebSocket connection to `ws://localhost:8080/graphql` using `graphql-ws` protocol
- **THEN** backend server establishes a persistent WebSocket connection and acknowledges client session

### Requirement: Broadcast Seat Status Updates
The backend system SHALL emit a real-time event through `seatStatusUpdated` subscription whenever a seat status transitions to `HELD` or `AVAILABLE`.

#### Scenario: Receiving seat hold updates
- **WHEN** user A holds a seat via `holdSeat` mutation
- **THEN** user B (subscribed to `seatStatusUpdated`) receives a payload containing the seat ID, new status `HELD`, and hold timestamp

#### Scenario: Receiving seat expiration release updates
- **WHEN** rabbitmq expiration worker releases a seat back to `AVAILABLE`
- **THEN** subscribed client receives a payload containing the seat ID and new status `AVAILABLE`
