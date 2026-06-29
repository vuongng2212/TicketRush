# mock-payment-gateway Specification

## Purpose
TBD - created by archiving change graphql-realtime-web-client. Update Purpose after archive.
## Requirements
### Requirement: Mock Payment Processing
The system SHALL provide a mock payment gateway that simulates bank transfer or QR code scan, transitioning the order status from `PENDING_PAYMENT` to `COMPLETED` or `CANCELLED`.

#### Scenario: Successful simulated payment
- **WHEN** user clicks "Simulate Payment Success" on payment page
- **THEN** order status is set to `COMPLETED` and ticket status transitions to `CONFIRMED`

### Requirement: QR Ticket Generation
The system SHALL generate a unique QR code for each confirmed ticket, rendering it on the web client interface.

#### Scenario: QR display after purchase
- **WHEN** order transitions to `COMPLETED`
- **THEN** client UI shows "Order Completed" with ticket list containing an image QR code representing the ticket ID

