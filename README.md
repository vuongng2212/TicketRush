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

*   **Backend:** Java 21, Spring Boot 3.3, Spring for GraphQL, Spring Data JPA, gRPC (grpc-spring-boot-starter).
*   **Frontend:** React, Next.js 14+ (App Router), TypeScript, Tailwind CSS, Apollo Client / WebSockets.
*   **Databases & Caching:** PostgreSQL 16 (Lưu trữ bền vững), Redis 7 (Lua Script xử lý hold ghế nhanh & cache sơ đồ).
*   **Message Broker:** RabbitMQ 3.13 (Delayed Message Exchange để tự động hủy vé sau 10 phút).
*   **Infrastructure & Testing:** Docker Compose, k6 (Load Testing).

---

## 📑 Tài Liệu Phát Triển (Documentation)

Toàn bộ tài liệu phân tích nghiệp vụ và thiết kế kỹ thuật chuẩn chỉnh nằm trong thư mục `/docs`:
-   **[BRD (Business Requirements Document)](/docs/BRD.md):** Bối cảnh, mục tiêu kinh doanh và phạm vi dự án.
-   **[SRS (Software Requirements Specification)](/docs/SRS.md):** Yêu cầu chức năng, phi chức năng và chỉ số hiệu năng cụ thể.
-   **[Use Case Specification](/docs/USE_CASE.md):** Đặc tả luồng xử lý chi tiết cho các use case cốt lõi.
-   **[System Architecture & Design](/docs/ARCHITECTURE.md):** Phân tích luồng dữ liệu, biểu đồ trình tự (Sequence Diagrams) bằng Mermaid.

---

## 📅 Lộ Trình Phát Triển Agile / Scrum (Agile Roadmap)

Dự án được chia làm **4 Sprints** (mỗi Sprint dự kiến kéo dài 1-2 tuần làm việc):

### 🔄 Sprint 1: Setup Infrastructure, Database & Core Auth
*   **Mục tiêu:** Dựng xong môi trường Docker Compose, thiết kế database entity, migrations và API Đăng nhập/Đăng ký.
*   **Các Task chính:**
    1. Khởi chạy `docker-compose.yml` (Postgres, Redis, RabbitMQ với delayed plugin).
    2. Viết Migration/Schema tạo bảng trong PostgreSQL.
    3. Cài đặt Spring Security + JWT Authentication.
    4. Thiết kế các schema GraphQL đầu tiên (`User`, `Concert`).

### ⚡ Sprint 2: High-Concurrency Seat Holding Engine (Trọng tâm Backend)
*   **Mục tiêu:** Triển khai core logic đặt giữ ghế tốc độ cao an toàn bằng Redis và tự động thu hồi bằng RabbitMQ.
*   **Các Task chính:**
    1. Viết Redis Service tích hợp Lua Script kiểm tra & giữ ghế (Seat Reservation).
    2. Cấu hình RabbitMQ Delayed Message Exchange.
    3. Viết Expiration Consumer để lắng nghe sự kiện timeout 10 phút để tự động hủy đơn và giải phóng ghế.
    4. Viết các Unit Test / Integration Test chạy multi-threads kiểm tra Race Condition (chống trùng ghế).

### 🌐 Sprint 3: GraphQL Real-time & Web Client (Next.js & SVG Map)
*   **Mục tiêu:** Xây dựng Next.js frontend với sơ đồ ghế SVG động tương tác real-time qua GraphQL Subscriptions.
*   **Các Task chính:**
    1. Cấu hình Apollo Server WebSockets Subscriptions trên Spring Boot.
    2. Dựng giao diện Next.js: Concert Detail, Interactive SVG Seat Map.
    3. Kết nối GraphQL Subscriptions: Đồng bộ màu ghế tức thời khi có sự kiện `Hold` hoặc `Release` từ backend.
    4. Dựng trang giả lập thanh toán Momo QR Code + idempotent webhook xử lý đơn hàng.

### 🛡️ Sprint 4: gRPC Scanner, Load Test & Deployment
*   **Mục tiêu:** Triển khai cổng soát vé gRPC B2B, kiểm thử tải hệ thống bằng k6 và hoàn thiện tài liệu.
*   **Các Task chính:**
    1. Định nghĩa Protobuf và sinh code gRPC Server trên Spring Boot.
    2. Build trang Web Admin Scanner trên Next.js sử dụng Camera quét QR code gọi API Route (gRPC Client).
    3. Viết script k6 load test hệ thống dưới tải 2,000+ RPS, ghi nhận báo cáo hiệu năng.
    4. Hoàn thiện tài liệu README kết quả load test.
