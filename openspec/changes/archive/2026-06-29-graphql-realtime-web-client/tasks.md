## 1. Backend WebSockets & GraphQL Subscription Setup

- [ ] 1.1 Add spring-boot-starter-websocket dependency in backend pom.xml
- [ ] 1.2 Enable GraphQL WebSocket endpoint and configure connection intercepter to extract JWT authentication tokens from connectionParams
- [ ] 1.3 Add Subscription schema to schema.graphqls
- [ ] 1.4 Implement SeatEventPublisher containing Sinks.many() to multicast seat changes
- [ ] 1.5 Implement @SubscriptionMapping resolver for seatStatusUpdated subscription in BookingGraphQLController
- [ ] 1.6 Update BookingService and ExpirationMessageConsumer to emit seat updates to SeatEventPublisher when seats are held or released

## 2. Next.js Web Client Setup & Apollo Configuration

- [ ] 2.1 Add graphql-ws, @apollo/client, and tailwind/lucide dependencies to Next.js package.json
- [ ] 2.2 Configure Apollo Client with HttpLink and GraphQLWsLink split by operation type (Http for query/mutation, Ws for subscription)
- [ ] 2.3 Create Auth Context provider to manage JWT local storage token and pass it to WebSocket link initialization parameters
- [ ] 2.4 Set up basic layout and routing structure on Next.js matching design-taste-frontend style guidelines

## 3. Interactive SVG Seat Map & Real-time Integration

- [ ] 3.1 Design Interactive SeatMap component rendering dynamically based on SVG nodes (green/blue for Vip/Standard, orange for Held, grey for Sold)
- [ ] 3.2 Implement seat select state and trigger holdSeat mutation
- [ ] 3.3 Set up useSubscription in Next.js to update the locally stored seat states dynamically when a seatStatusUpdated event arrives
- [ ] 3.4 Ensure seat selection is disabled / state visual transitions instantly (with micro-animations/transitions) if a HELD event for that seat is received from other users

## 4. Payment Simulator & QR Ticket Rendering

- [ ] 4.1 Create mock payment landing page displaying total cost and QR code instructions
- [ ] 4.2 Build simulated "Confirm Success Payment" and "Simulate Expiration/Failure" triggers
- [ ] 4.3 Implement order completing webhook or graphql mutation and transition tickets to confirmed state
- [ ] 4.4 Render confirmed ticket list containing custom generated SVG/Image QR code representing confirmation token
