## ADDED Requirements

### Requirement: gRPC ticket validation proto
The system MUST define a gRPC service for ticket validation in a protobuf schema (`ticket.proto`), including message structures for authentication, validation request, and validation response.

#### Scenario: Compile protobuf successfully
- **WHEN** Maven package command is executed or protobuf compiler runs
- **THEN** Java classes and gRPC service stubs for TicketService are generated.

### Requirement: gRPC ticket check-in server
The backend system MUST expose a gRPC server endpoint on port 50051 that implements the ticket validation service. It MUST verify the ticket token, check if the ticket is valid, mark the status of the ticket as `CHECKED_IN` in the database, and return validation status (success/failure) with ticket details.

#### Scenario: Valid ticket validation
- **WHEN** a gRPC request is received with a valid, unused ticket token and a valid admin API key/token
- **THEN** database updates ticket status to `CHECKED_IN`, logs audit details, and returns status `SUCCESS`.

#### Scenario: Duplicate ticket validation
- **WHEN** a gRPC request is received with a ticket token that is already `CHECKED_IN`
- **THEN** the server returns status `ALREADY_CHECKED_IN` and does not modify the database.

#### Scenario: Invalid ticket validation
- **WHEN** a gRPC request is received with an invalid or non-existent ticket token
- **THEN** the server returns status `INVALID_TICKET`.
