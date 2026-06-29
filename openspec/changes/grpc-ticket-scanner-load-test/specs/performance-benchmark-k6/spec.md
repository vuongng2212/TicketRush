## ADDED Requirements

### Requirement: k6 load test script for ticket holding
The system MUST provide a k6 load test script that simulates highly concurrent user registrations, logins, concert data retrieval, and concurrent seat holding operations.

#### Scenario: k6 booking load test execution
- **WHEN** k6 script `booking-load-test.js` is run against the local docker-compose environment with 50 virtual users ramping up to 200 virtual users
- **THEN** the script successfully logs performance metrics like RPS, HTTP response times (p95, p99), and verification of correct error codes (like 409 Conflict/Locked when seats are contested).

### Requirement: k6 load test script for gRPC ticket validation
The system MUST provide a k6 performance script or HTTP benchmark script to validate check-in performance limits under concurrent ticket scans.

#### Scenario: k6 check-in benchmark execution
- **WHEN** the benchmark script is executed against the ticket verification endpoints
- **THEN** it validates that check-in transaction latency remains under 50ms at p95 under steady state load of 50 RPS.
