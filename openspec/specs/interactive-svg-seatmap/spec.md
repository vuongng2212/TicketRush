# interactive-svg-seatmap Specification

## Purpose
TBD - created by archiving change graphql-realtime-web-client. Update Purpose after archive.
## Requirements
### Requirement: Interactive SVG Seat Map Render
The Next.js client application SHALL render an interactive SVG-based seat map that displays seats color-coded by zone (VIP, Standard) and status (AVAILABLE, HELD, SOLD).

#### Scenario: Visual status styling
- **WHEN** seat map is rendered
- **THEN** seats with status AVAILABLE are green/blue, HELD are orange, and SOLD are greyed out

### Requirement: Real-time UI Update
The seat map component SHALL subscribe to `seatStatusUpdated` and dynamically update seat colors and click states without refreshing the page.

#### Scenario: Seat status change in viewport
- **WHEN** subscription event is received indicating seat ID `XYZ` status is `HELD`
- **THEN** SVG element for seat `XYZ` transitions color to orange and becomes unclickable for other clients

