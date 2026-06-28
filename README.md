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
-   **[Agile Roadmap & Sprints](/docs/AGILE_ROADMAP.md):** Phân chia lộ trình Sprint và các task phát triển theo mô hình Scrum.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

*(Mục này sẽ được cập nhật chi tiết các lệnh khởi chạy backend, frontend và hạ tầng Docker sau khi hoàn thành Sprint 1).*
