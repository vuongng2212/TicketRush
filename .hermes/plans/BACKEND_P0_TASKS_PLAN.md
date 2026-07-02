# Backend P0 Tasks — Match with Frontend (Electric Pulse)

**Date:** June 30, 2026  
**Goal:** Make Spring Boot backend fully compatible with Next.js frontend Phase 1  
**Status:** P0 only (4 tasks)

## Current State Assessment

### ✅ Already working
- GraphQL schema with: `getConcertDetail`, `me`, `register`, `login`, `holdSeat`, `seatStatusUpdated`
- `ConcertGraphQLController.getConcertDetail(concertId)` — works
- `AuthGraphQLController` — register/login/me all work
- `BookingGraphQLController.holdSeat(seatId)` + `seatStatusUpdated(concertId)` subscription
- `SecurityConfig` permits `/graphql` and `/graphiql`
- `CorsConfig` allows all origins (dev mode)
- `GraphQlAuthInterceptor` handles JWT over WebSocket
- `DatabaseSeeder` seeds 1 default concert + 2000 seats
- `BookingService.holdSeat()` with Redis lock + DB transaction + RabbitMQ expiration
- `BookingService.releaseExpiredOrder()` for TTL cleanup
- `Order` entity with status PENDING_PAYMENT, COMPLETED, EXPIRED, CANCELLED
- `Ticket` entity with ticketCode
- `Concert` entity (id, title, description, startTime, venue, status, createdAt, updatedAt)
- `SeatZone` entity (id, concertId, name, price, totalSeats)
- `Seat` entity (id, seatZoneId, seatNumber, status, heldByUserId, heldUntil)

### ❌ Missing for frontend match
- `getConcerts` query (frontend `EventCarousel` currently uses MOCK_EVENTS)
- `confirmPayment(orderId, paymentMethod)` mutation (frontend uses fake `handleSimulatePayment`)
- `cancelOrder(orderId)` mutation (optional for P0, defer to P1)
- Database seed has only 1 concert — need 8 for carousel demo

### ⚠️ CRITICAL: Redis init for new seats
- `RedisReservationService.initializeSeats(concertId, seatIds)` MUST be called after each new concert's seats are saved
- Otherwise `holdSeat` will return `false` (Redis "available" set is empty for new concerts)
- DatabaseSeeder will need to inject RedisReservationService and call initializeSeats per concert

### ⚠️ Potential issues
- Frontend `page.tsx` MOCK_CONCERT_ID = "00000000-0000-0000-0000-000000000000" (DB has "00000000-0000-0000-0000-000000000001") — fix on frontend (Task 5)
- WebSocket CORS handled by CorsConfig; should work for dev (Task 4 verify)

---

## TASK 1: Thêm getConcerts query

**Files to modify:**
- `server/src/main/resources/graphql/schema.graphqls` — add `getConcerts` query + `ConcertSummary` type
- `server/src/main/java/com/ticketrush/server/domain/concert/ConcertGraphQLController.java` — add `getConcerts` method

**Schema additions:**
```graphql
type ConcertSummary {
  id: ID!
  title: String!
  description: String
  venue: String!
  startTime: String!
  status: String!
  availableSeats: Int!
  minPrice: Float!
  maxPrice: Float!
  zoneCount: Int!
  imageUrl: String  # optional, for carousel
}

extend type Query {
  getConcerts(status: String, limit: Int): [ConcertSummary!]!
  getFeaturedConcerts(limit: Int = 8): [ConcertSummary!]!
}
```

**Controller method:**
```java
@QueryMapping
public List<ConcertSummaryResponse> getConcerts(
    @Argument(required = false) String status,
    @Argument(required = false) Integer limit) {
  // Fetch concerts, compute seat/zone/price stats
}
```

**New DTO class:** `ConcertSummaryResponse.java`

---

## TASK 2: Expand DatabaseSeeder với 8 concerts

**Files to modify:**
- `server/src/main/java/com/ticketrush/server/infrastructure/seeding/DatabaseSeeder.java`

**8 concerts to seed (match frontend MOCK_EVENTS):**
1. BlackPink World Tour — My Dinh Stadium — 2,500,000 VND
2. Ho Tram Music Festival — Ho Tram Beach — 1,800,000 VND
3. Hoai Linh Comedy Show — Saigon Opera House — 800,000 VND
4. Son Tung M-TP Sky Tour — Hanoi Indoor Gymnasium — 3,200,000 VND
5. Vietnam vs Thailand — Thong Nhat Stadium — 500,000 VND
6. Monsoon Music Festival — Hanoi Opera House — 1,500,000 VND
7. Den Vau Live in Saigon — The Reverie Saigon — 1,200,000 VND
8. Hoa Minzy Solo Concert — Phu Tho Stadium — 950,000 VND

**Each concert:** 3 zones (VIP, Standard, Economy) with realistic seat counts and prices.

---

## TASK 3: confirmPayment mutation

**Files to modify:**
- `server/src/main/resources/graphql/schema.graphqls` — add `confirmPayment` mutation + `PaymentResult` type
- `server/src/main/java/com/ticketrush/server/domain/order/BookingGraphQLController.java` — add `confirmPayment` method
- `server/src/main/java/com/ticketrush/server/domain/order/BookingService.java` — add `confirmPayment(orderId, userId, paymentMethod)` method
- `server/src/main/java/com/ticketrush/server/domain/order/OrderRepository.java` — add `findByIdAndUserId` if needed

**Schema additions:**
```graphql
type PaymentResult {
  order: Order!
  ticket: Ticket!
  paymentReference: String!
  paymentMethod: String!
  paidAt: String!
  totalPrice: Float!
}

enum PaymentMethod {
  VNPAY
  MOMO
  ZALOPAY
  BANKING
  CARD
}

extend type Mutation {
  confirmPayment(orderId: ID!, paymentMethod: PaymentMethod!): PaymentResult!
  cancelOrder(orderId: ID!): Order!
}
```

**Service logic:**
```java
@Transactional
public Order confirmPayment(UUID orderId, UUID userId, String paymentMethod) {
  Order order = orderRepository.findById(orderId)
      .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
  
  if (!order.getUserId().equals(userId)) {
    throw new SecurityException("Order does not belong to user");
  }
  if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
    throw new IllegalStateException("Order is not in PENDING_PAYMENT status");
  }
  if (order.getExpiresAt().isBefore(LocalDateTime.now())) {
    throw new IllegalStateException("Order has expired");
  }
  
  order.setStatus(OrderStatus.COMPLETED);
  order = orderRepository.save(order);
  
  // Get ticket
  Ticket ticket = ticketRepository.findByOrderId(orderId).get(0);
  
  // Update seat to SOLD
  Seat seat = seatRepository.findById(ticket.getSeatId()).get();
  seat.setStatus(SeatStatus.SOLD);
  seatRepository.save(seat);
  
  // Broadcast event
  seatEventPublisher.publish(SeatUpdatedPayload.builder()
      .seatId(seat.getId())
      .concertId(...)
      .status("SOLD")
      .heldByUserId(userId)
      .build());
  
  return order;
}
```

**NOTE:** Payment is simulated (no real gateway). Generate a fake paymentReference like `PAY-{UUID}`.

---

## TASK 4: Verify WebSocket CORS + security

**Goal:** Ensure Apollo Client WebSocket subscription works from Next.js dev (port 3000) → Spring Boot (port 8080).

**Verify:**
- `SecurityConfig.securityFilterChain` permits `/graphql` for both HTTP and WS upgrade
- `CorsConfig` allows `http://localhost:3000`
- `GraphQlAuthInterceptor` extracts Bearer token from `connectionInitPayload`
- No CSRF blocking WS handshake (already disabled)

**Likely already correct**, but Task 4 will run a smoke test.

---

## TASK 5: Wire backend changes to frontend

**Files to modify:**
- `client/app/page.tsx`:
  - Replace `MOCK_CONCERT_ID = "00000000-0000-0000-0000-000000000000"` with `"00000000-0000-0000-0000-000000000001"` (DB seeded ID)
  - Add `GET_CONCERTS` GraphQL query
  - Replace `MOCK_EVENTS` array with `useQuery(GET_CONCERTS)?.concerts || []`
  - Replace `handleSimulatePayment` with real `confirmPayment` mutation
  - Add `CANCEL_ORDER` mutation (optional)

**New GraphQL operations:**
```graphql
query GetConcerts($status: String, $limit: Int) {
  getConcerts(status: $status, limit: $limit) {
    id
    title
    description
    venue
    startTime
    status
    availableSeats
    minPrice
    maxPrice
    zoneCount
    imageUrl
  }
}

mutation ConfirmPayment($orderId: ID!, $paymentMethod: PaymentMethod!) {
  confirmPayment(orderId: $orderId, paymentMethod: $paymentMethod) {
    order {
      id
      status
      totalPrice
      expiresAt
    }
    ticket {
      id
      ticketCode
    }
    paymentReference
    paymentMethod
    paidAt
    totalPrice
  }
}
```

**Transform ConcertSummary → EventCard event format:**
```ts
{
  id: concert.id,
  title: concert.title,
  venue: concert.venue,
  date: concert.startTime,
  price: concert.minPrice, // VND
  rating: 4.5, // hardcoded for now
  reviewsCount: 0, // hardcoded
  ticketsAvailable: concert.availableSeats,
  imageUrl: concert.imageUrl || `https://picsum.photos/seed/${concert.id}/800/600`,
  category: 'concert', // derive from title/description
}
```

---

## TASK 6: Build verification

**Commands:**
```bash
cd /home/vuongnguyen/Projects/TicketRush/server
./mvnw test
./mvnw clean package -DskipTests

cd /home/vuongnguyen/Projects/TicketRush/client
pnpm build
```

**Acceptance criteria:**
- ✅ All backend tests pass
- ✅ Backend compiles with 0 errors
- ✅ Frontend `pnpm build` passes with 0 errors
- ✅ GraphQL schema validates (Spring Boot starts up successfully)

---

## Execution Strategy

Each task will be delegated to **Codex CLI** in background with detailed prompt (similar to frontend Phase 1 Days 5-12 that worked perfectly).

After each Codex run, I (Hermes) will:
1. Verify files exist and have correct content
2. Run build verification
3. Mark task complete in todo list
4. Move to next task
