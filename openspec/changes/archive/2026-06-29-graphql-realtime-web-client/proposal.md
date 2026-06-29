## Why

Xây dựng cơ chế đồng bộ sơ đồ ghế thời gian thực (Real-time Seat Map) giữa nhiều người dùng đang cùng xem hoặc thực hiện click giữ vé concert trên giao diện Web Client (Next.js 16 + SVG Map). Tối ưu hóa UI/UX bằng cách cung cấp trải nghiệm mượt mà, phản hồi tức thời khi có thay đổi trạng thái ghế mà không cần tải lại trang.

## What Changes

- **Backend (Spring Boot):**
  - Tích hợp và cấu hình WebSocket Transport cho Spring for GraphQL.
  - Bổ sung GraphQL Subscription `seatStatusUpdated(concertId: ID!): Seat!` để phát các sự kiện cập nhật trạng thái ghế.
  - Cập nhật `BookingService` để bắn thông tin thay đổi trạng thái ghế lên subcription channel khi có ghế được giữ (`HELD`) hoặc giải phóng (`AVAILABLE`).
- **Frontend (Next.js):**
  - Cấu hình Apollo Client hỗ trợ cả HTTP (Queries/Mutations) và WebSocket (Subscriptions) sử dụng `graphql-ws`.
  - Thiết kế màn hình chi tiết Concert và sơ đồ ghế tương tác dạng SVG (phân biệt màu sắc các vùng VIP/Standard và trạng thái ghế).
  - Kết nối Real-time GraphQL Subscriptions để cập nhật động màu sắc/trạng thái ghế trên SVG Map khi có user khác thao tác.
  - Xây dựng màn hình Mock Payment và giả lập webhook / callback cập nhật trạng thái đơn hàng và hiển thị vé QR Code.

## Capabilities

### New Capabilities
- `graphql-realtime-subscriptions`: Cấu hình WebSocket endpoint, Subscription Mapping trên Backend và tích hợp GraphQL Subscriptions Client trên Next.js.
- `interactive-svg-seatmap`: Thiết kế UI/UX sơ đồ ghế bằng SVG tương tác, quản lý client-side state mượt mà, áp dụng các tiêu chí của `taste-skill`.
- `mock-payment-gateway`: Giả lập quy trình thanh toán vé thông qua giao diện QR code giả lập và cơ chế callback để hoàn thành đơn hàng.

### Modified Capabilities
- Không có.

## Impact

- **APIs:** Bổ sung WebSocket endpoint `/graphql` hỗ trợ giao thức GraphQL over WebSocket (`graphql-ws`). Bổ sung subscription vào schema.
- **Dependencies:** Thêm `spring-boot-starter-websocket` ở backend; `graphql-ws` và `@apollo/client` ở frontend.
- **Components:** Tạo mới component `SeatMap` dạng SVG, `ConcertDetail` page, và `Payment` page trên Next.js client.
