# System Architecture & Design Document - TicketRush

## 1. PHÂN TÍCH THIẾT KẾ KỸ THUẬT (Technical Breakdown)

Hệ thống **TicketRush** được xây dựng theo mô hình **Monolith** nhưng tuân thủ thiết kế phân lớp rõ ràng (Layered Architecture) kết hợp với các cổng giao tiếp độc lập (Ports and Adapters / Hexagonal Architecture). Điều này giúp hệ thống dễ bảo trì, dễ viết test và sẵn sàng chuyển đổi sang Microservices khi cần thiết.

---

## 2. KIẾN TRÚC VẬN HÀNH (Runtime & Infrastructure Architecture)

Hệ thống bao gồm các thành phần hạ tầng cốt lõi:
1.  **Next.js 16 Web Client:** Chạy môi trường Node.js phía Client, giao tiếp qua GraphQL HTTP (Queries/Mutations) và WebSockets (Subscriptions).
2.  **Spring Boot Monolith Application:** Chạy trên môi trường JVM 21, lắng nghe trên 2 cổng:
    *   **Port 8080:** HTTP/WebSocket Server phục vụ GraphQL API.
    *   **Port 50051:** gRPC Server phục vụ soát vé check-in.
3.  **Redis Cache & In-Memory Store:**
    *   Lưu thông tin vị trí ghế trống của từng zone (`concert:{id}:zone:{id}:available`) dưới dạng Set.
    *   Lưu thông tin các ghế đang bị giữ (`concert:{id}:held`) dưới dạng Hash.
    *   Lưu trữ Idempotency Key của giao dịch thanh toán.
4.  **RabbitMQ Message Broker:**
    *   Sử dụng `rabbitmq_delayed_message_exchange` plugin để tạo hàng đợi tin nhắn trì hoãn phục vụ nghiệp vụ thu hồi vé hết hạn thanh toán (Ticket timeout).
5.  **PostgreSQL Relational DB:**
    *   Lưu trữ dữ liệu có cấu trúc ổn định và bền vững (Users, Concerts, SeatZones, Seats, Orders, Tickets).

---

## 3. THIẾT KẾ CHI TIẾT CÁC LUỒNG XỬ LÝ (Sequence Diagrams - Mermaid)

Dưới đây là mô tả luồng xử lý kỹ thuật của 2 quy trình quan trọng nhất trong hệ thống.

### 3.1 Quy trình Đặt vé & Giữ ghế (Hold Seat Sequence)
Luồng xử lý tối ưu hóa hiệu năng, giảm thiểu ghi xuống DB:

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Khán giả (Client)
    participant Nest as Next.js UI
    participant Spring as Spring Boot Monolith
    participant Redis as Redis Cache
    participant Postgres as PostgreSQL DB
    participant RMQ as RabbitMQ (Delay Exchange)

    Buyer->>Nest: Click chọn ghế "A1" & Nhấn Đặt Vé
    Nest->>Spring: GraphQL Mutation: holdSeat(seatId: "A1")
    Spring->>Redis: Thực thi Lua Script (Check & Hold Seat)
    alt Ghế đã bị giữ hoặc đã bán (Redis return 0)
        Redis-->>Spring: Trả về 0 (Thất bại)
        Spring-->>Nest: GraphQL Error: "Ghế không còn trống"
        Nest-->>Buyer: Hiển thị thông báo: Ghế đã bị người khác chọn
    else Ghế còn trống (Redis return 1)
        Redis-->>Spring: Trả về 1 (Giữ thành công trên RAM)
        Spring->>Postgres: INSERT INTO orders (status = 'PENDING')
        Spring->>Postgres: UPDATE seats SET status = 'HELD', locked_by = userId WHERE id = 'A1'
        Spring->>RMQ: Gửi Message Hủy Vé (Delay 10 phút)
        Spring-->>Nest: Trả về thành công & thông tin Order
        Spring->>Nest: Phát event GraphQL Subscription: seatStatusChanged("A1", "HELD")
        Nest-->>Buyer: Hiển thị đếm ngược 10:00 & chuyển màu ghế sang Đỏ
        Note over Nest: Tất cả người dùng khác đang xem sơ đồ ghế<br/>sẽ nhận được Subscription và thấy ghế "A1" chuyển sang màu Cam.
    end
```

---

### 3.2 Quy trình Xử lý Hết hạn Thanh toán (Ticket Expiration Sequence)
Đảm bảo tự động giải phóng tài nguyên hệ thống bất đồng bộ:

```mermaid
sequenceDiagram
    autonumber
    participant RMQ as RabbitMQ (Delay Exchange)
    participant Consumer as Expiration Consumer (Spring)
    participant Postgres as PostgreSQL DB
    participant Redis as Redis Cache
    participant WebSocket as GraphQL Subscription

    RMQ->>Consumer: Giao message sau 10 phút (orderId: "ord_123")
    Consumer->>Postgres: SELECT status FROM orders WHERE id = 'ord_123'
    alt Đơn hàng đã thanh toán thành công (COMPLETED)
        Postgres-->>Consumer: status = 'COMPLETED'
        Note over Consumer: Bỏ qua tin nhắn, kết thúc luồng.
    else Đơn hàng chưa thanh toán (PENDING)
        Postgres-->>Consumer: status = 'PENDING'
        Consumer->>Postgres: UPDATE orders SET status = 'EXPIRED' WHERE id = 'ord_123'
        Consumer->>Postgres: UPDATE seats SET status = 'AVAILABLE', locked_by = NULL WHERE id = 'A1'
        Consumer->>Redis: Chạy Lua Script giải phóng (Xóa khỏi HELD, trả về AVAILABLE Set)
        Consumer->>WebSocket: Phát event: seatStatusChanged("A1", "AVAILABLE")
        Note over WebSocket: Giao diện của tất cả người dùng<br/>tự động chuyển ghế "A1" về lại màu xanh lá.
    end
```

---

## 4. CHI TIẾT THIẾT KẾ gRPC (gRPC Service Design)
Luồng soát vé B2B sử dụng gRPC được tối ưu hóa như thế nào?
- **Protocol Buffers (Protobuf):** Định nghĩa rõ cấu trúc dữ liệu nhị phân (binary) gọn nhẹ, giúp truyền tải nhanh gấp nhiều lần JSON/REST thông thường.
- **HTTP/2 Connection Multiplexing:** gRPC Server duy trì một kết nối HTTP/2 duy nhất giữa thiết bị quét vé và backend, giảm thiểu chi phí bắt tay (TCP handshake) cho mỗi lượt soát vé.
- **Bi-directional Streaming (Tùy chọn nâng cấp):** Cho phép gRPC Server gửi trực tiếp thống kê số lượng người đã vào cổng ngược lại cho thiết bị quét.
