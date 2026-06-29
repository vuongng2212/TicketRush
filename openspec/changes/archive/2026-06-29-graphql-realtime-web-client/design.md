## Context
Hệ thống hiện tại (Sprint 2) đã có thể đăng ký, đăng nhập và giữ ghế an toàn dưới dạng các HTTP Request ngắn (GraphQL Mutations/Queries). Tuy nhiên, đối với hệ thống bán vé chịu tải cao như TicketRush, việc phản hồi trạng thái sơ đồ ghế một cách tức thời khi có user click giữ ghế (đổi màu ghế sang cam/bận) là cực kỳ quan trọng để tăng tỷ lệ chuyển đổi và tránh tranh chấp.
Chúng ta cần tích hợp giao thức truyền thông hai chiều qua WebSocket cho luồng Client-to-Server B2C và xây dựng UI Client hoàn chỉnh có độ phản hồi cao.

## Goals / Non-Goals

**Goals:**
- Cấu hình và khởi chạy kết nối WebSocket trên Spring for GraphQL hỗ trợ Subscriptions.
- Cấu hình GraphQL client trên Next.js sử dụng Apollo Client kết nối qua link WebSocket và HTTP (Split link).
- Thiết kế sơ đồ ghế dạng SVG đáp ứng chuẩn thiết kế Taste-Skill (visual balance, dark theme, micro-interactions).
- Phát sự kiện cập nhật ghế real-time tới tất cả client đang xem sơ đồ ghế của Concert.
- Xây dựng màn hình Payment giả lập và tự động hoàn thành đơn hàng, xuất vé QR Code.

**Non-Goals:**
- Tích hợp cổng thanh toán thật (VNPay/Momo/Stripe). Chỉ dựng trang Mock Payment.
- Scale-out WebSocket gateway qua Redis Pub/Sub (vẫn thiết kế sẵn structure nhưng ở scope này chạy local server).

## Decisions

### 1. GraphQL over WebSocket Protocol (`graphql-ws` vs `subscriptions-transport-ws`)
- **Lựa chọn:** Sử dụng thư viện `graphql-ws` cho cả client (Next.js) và backend (Spring Boot).
- **Lý do:** `subscriptions-transport-ws` đã bị deprecated từ lâu và không còn bảo trì. Thư viện `graphql-ws` hiện nay là tiêu chuẩn được khuyên dùng cho cả Spring Boot 3+ và Next.js / Apollo Client.

### 2. Live State Broadcasting Mechanism (In-Memory Sinks vs Redis PubSub)
- **Lựa chọn:** Sử dụng `Sinks.many().multicast().onBackpressureBuffer()` của Project Reactor trong Spring Boot để làm Event Broker cục bộ.
- **Lý do:** Đơn giản, an toàn, hiệu năng cực cao khi chạy trên một instance cục bộ và tích hợp hoàn hảo với Spring for GraphQL Subscriptions (trả về một `Publisher<Seat>`). Nếu sau này cần scale-out lên nhiều node, ta có thể dễ dàng thay thế bằng Redis Pub/Sub hoặc RabbitMQ Broadcast Exchange.

### 3. SVG Map rendering (Static SVG template vs Canvas)
- **Lựa chọn:** Render sơ đồ ghế bằng SVG động viết bằng React Components, lưu dữ liệu layout tọa độ (x, y) trong DB/Json.
- **Lý do:** Số lượng ghế trong một Concert Zone tầm 50-200 ghế, việc vẽ bằng SVG giúp dễ style CSS, add hover effects và handle click event trực tiếp trên DOM của React thay vì Canvas phức tạp khó customize.

## Risks / Trade-offs

- **[Risk 1]** WebSocket Connection Leak: Lượng truy cập đồng thời lớn gây cạn kiệt socket ports trên backend.
  - *Mitigation:* Thiết lập heartbeat/ping-pong định kỳ (30s) từ client để tự động dọn dẹp các websocket connections bị ngắt đột ngột (zombie connection).
- **[Risk 2]** Token Authentication over WebSockets: Trình duyệt không gửi custom headers (Authorization Bearer) khi bắt đầu bắt tay (handshake) WebSocket.
  - *Mitigation:* Truyền JWT Token thông qua payload params khi thiết lập connection (connectionParams) và bắt token ở interceptor phía Spring Boot.
