# 🎟️ TicketRush - High-Throughput Concert E-Ticketing System

TicketRush là một hệ thống bán vé Concert (Monolith Backend bằng Spring Boot, Frontend bằng Next.js) được thiết kế đặc biệt để giải quyết các bài toán về **tải đỉnh (Flash Sale)**, **chống bán trùng ghế (Double Booking)**, **đồng bộ hóa trạng thái real-time**, và **soát vé tốc độ cao (B2B check-in via gRPC)**.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```
                            ┌────────────────────────┐
                            │  Client (Next.js 14+)  │
                            └───────────┬────────────┘
                                        │ GraphQL (Queries, Mutations, Subscriptions)
                                        ▼ [Port 8080]
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TICKETRUSH SPRING MONOLITH                            │
│                                                                                 │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────┐  │
│  │      GraphQL Engine   │  │    Business Logic     │  │     gRPC Server     │  │
│  │ (Spring for GraphQL)  │  │ (Services, Entities)  │  │ (Ticket Check-in)   │  │
│  └──────────┬────────────┘  └───────────┬___________┘  └──────────▲──────────┘  │
└─────────────┼───────────────────────────┼─────────────────────────┼─────────────┘
              │                           ▼                         │ gRPC [Port 50051]
              │                 ┌───────────────────┐               │
              │                 │   PostgreSQL DB   │               │
              │                 └───────────────────┘               │
              │                                                     │
              └─────────────────────────┐                           │
                                        ▼                           │
                                ┌───────────────┐                   │
                                │  Redis Cache  │                   │
                                └───────┬───────┘                   │
                                        ▼                           │
                                ┌───────────────┐                   │
                                │   RabbitMQ    │                   │
                                └───────────────┘                   │
                                                                    │
                                   ┌────────────────────────────────┴──┐
                                   │ B2B: Web Admin Scanner (Camera)   │
                                   └───────────────────────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

|*   **Backend:** Java 21, Spring Boot 4.1.0, Spring for GraphQL, Spring Data JPA, gRPC (grpc-spring-boot-starter).
*   **Frontend:** React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS, Apollo Client / WebSockets.
*   **Databases & Caching:** PostgreSQL 16 (Lưu trữ bền vững), Redis 7 (Lua Script xử lý hold ghế nguyên tử & cache sơ đồ).
*   **Message Broker:** RabbitMQ 3.13 (Delayed Message Exchange để tự động hủy giữ vé sau 10 phút).
*   **Infrastructure & Testing:** Docker Compose, k6 (Load Testing), OpenSpec (SDD).

---

## 📑 Tài Liệu Phát Triển (Documentation)

Toàn bộ tài liệu phân tích nghiệp vụ và thiết kế kỹ thuật chuẩn chỉnh nằm trong thư mục `/docs`:
-   **[BRD (Business Requirements Document)](/docs/BRD.md):** Bối cảnh, mục tiêu kinh doanh và phạm vi dự án.
-   **[SRS (Software Requirements Specification)](/docs/SRS.md):** Yêu cầu chức năng, phi chức năng và chỉ số hiệu năng cụ thể.
-   **[Use Case Specification](/docs/USE_CASE.md):** Đặc tả luồng xử lý chi tiết cho các use case cốt lõi.
-   **[System Architecture & Design](/docs/ARCHITECTURE.md):** Phân tích luồng dữ liệu, biểu đồ trình tự (Sequence Diagrams) bằng Mermaid.
-   **[Agile Roadmap & Sprints](/docs/AGILE_ROADMAP.md):** Phân chia lộ trình Sprint và các task phát triển theo mô hình Scrum.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### 1. Yêu cầu hệ thống
- **Docker** & **Docker Compose**
- **Java 21** (Eclipse Temurin)
- **Node.js 20+** & **pnpm**
- **k6** (cho load test)

### 2. Khởi động hạ tầng (Docker)
```bash
# Từ thư mục gốc dự án
docker compose up -d
# Kiểm tra: PostgreSQL (5433), Redis (6379), RabbitMQ (5672, 15672)
```

### 3. Chạy Backend (Spring Boot)
```bash
cd server
./mvnw spring-boot:run
# GraphQL Playground: http://localhost:8080/graphiql
# gRPC Server: port 50051
```

### 4. Chạy Frontend (Next.js)
```bash
cd client
pnpm install
pnpm dev
# Web: http://localhost:3000
```

### 5. Chạy Tests
```bash
cd server && ./mvnw test          # Backend tests (7 tests)
cd client && pnpm lint            # Frontend lint
```

### 6. Load Test (k6)
```bash
k6 run load-tests/booking-load-test.js
```

---

## 📊 Kết Quả Load Test (k6 Benchmark)

Benchmark được thực hiện với **200 Virtual Users** đồng thời, giả lập luồng mua vé hoàn chỉnh (register → login → fetch concert → hold seat) trên máy local.

| Chỉ số | Giá trị |
|:---|---:|
| **Tổng Requests** | 3,708 |
| **Throughput (RPS)** | ~66.5 req/s |
| **Error Rate** | **0.00%** 🎯 |
| **P95 Latency** | 3.98s (local machine) |
| **P90 Latency** | 3.58s |
| **Avg Latency** | 1.61s |
| **Checks Success** | 83.33% |
| **Total Iterations** | 1,236 |

> 🔥 **Không có lỗi HTTP 500, không double-booking!** Các checks `holdSeat` trả về 409 Conflict là hành vi mong đợi khi Redis Lua Script chặn đặt trùng ghế dưới tải 200 VUs đồng thời.

---

## 📈 Các Tính Năng Chính (Feature Highlights)

### 🪄 Real-time SVG Seat Map
Sơ đồ ghế tương tác cập nhật real-time qua **GraphQL Subscription** (WebSocket). Khi user A click giữ ghế, user B lập tức thấy ghế chuyển màu.

### 🔒 Atomic Seat Holding (Redis Lua Script)
Chống **Double Booking** tuyệt đối bằng script Lua chạy nguyên tử trên Redis, kết hợp **RabbitMQ Delayed Exchange** 10 phút để tự động giải phóng ghế nếu không thanh toán.

### 🎫 Mock Payment & QR Ticket
Thanh toán giả lập, xuất vé QR code. Có thể dùng camera điện thoại quét QR để soát vé tại cổng.

### 🛡️ gRPC Ticket Scanner (B2B)
Web Admin Scanner tại `/admin/scanner` sử dụng camera web để quét QR code, giao tiếp với backend qua **gRPC** (HTTP/2, Protobuf, port 50051) — kiến trúc B2B tốc độ cao, độ trễ thấp.
