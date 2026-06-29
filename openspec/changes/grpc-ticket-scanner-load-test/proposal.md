## Why

Để hoàn thành giai đoạn cuối của dự án TicketRush, chúng ta cần triển khai tính năng soát vé (check-in) vé tốc độ cao, hiệu năng cao và có tính năng load testing thực tế. 
gRPC (HTTP/2, Protobuf) là giao thức lý tưởng cho các hoạt động B2B/Nội bộ như thiết bị hoặc trang web soát vé tại cổng sự kiện để đảm bảo độ trễ thấp và băng thông tối thiểu. Đồng thời, việc chạy Load Test bằng k6 sẽ giúp đo đạc, đánh giá giới hạn chịu tải thực tế (TPS, Latency, Error Rate) của toàn bộ hệ thống (Spring Boot, Redis, PostgreSQL, RabbitMQ).

## What Changes

- **Backend (Spring Boot):**
  - Tích hợp gRPC Server sử dụng starter dependency.
  - Định nghĩa file protobuf `ticket.proto` cho luồng check-in.
  - Xây dựng `TicketGrpcService` xử lý logic xác thực và cập nhật trạng thái vé thành `CHECKED_IN` trong database.
- **Frontend (Next.js):**
  - Xây dựng trang Admin Scanner (`/admin/scanner`) cho phép sử dụng camera để quét mã QR từ vé.
  - Thiết lập API Route Next.js đóng vai trò gRPC Client kết nối đến backend gRPC Server.
- **Performance & Load Testing:**
  - Viết script load test k6 (`load-tests/booking-load-test.js`) giả lập luồng đặt vé đồng thời của 5,000 user.
  - Thiết lập k6 script kiểm thử hiệu năng soát vé gRPC hoặc API soát vé.

## Capabilities

### New Capabilities
- `grpc-ticket-validation`: Đặc tả giao thức và API soát vé qua gRPC Server/Client.
- `performance-benchmark-k6`: Kịch bản và chỉ số đo đạc load test hiệu năng hệ thống bằng k6.

### Modified Capabilities
<!-- Không có sửa đổi yêu cầu nghiệp vụ hiện tại -->

## Impact

- **gRPC Server Port:** Mặc định sử dụng cổng `50051`.
- **Dependencies:** Thêm `grpc-spring-boot-starter`, protobuf plugins ở backend; `@grpc/grpc-js`, `@grpc/proto-loader` và thư viện đọc QR (như `html5-qrcode` hoặc `react-qr-reader`) ở client.
- **k6 Load Testing Tool:** Cần cài đặt `k6` trên máy để chạy script load test.
