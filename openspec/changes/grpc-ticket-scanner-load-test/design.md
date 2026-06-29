## Context

Hệ thống TicketRush hiện đã chạy ổn định với các luồng cốt lõi: Auth, Đặt vé/Giữ ghế concurrency (Redis/RabbitMQ), GraphQL Query/Mutation/Subscription (Next.js client real-time).
Để hoàn thiện hệ thống, chúng ta cần:
1. Cơ chế soát vé (Check-in) hiệu năng cao dành cho quản trị viên/bảo vệ soát vé tại cửa sự kiện. Do đây là tương tác B2B/nội bộ giữa thiết bị soát vé và backend, gRPC là lựa chọn phù hợp nhất để giảm thiểu bandwidth, latency và đảm bảo type safety.
2. Web client cần một trang Admin Scanner tương tác trực tiếp với Camera của thiết bị, thực hiện đọc QR Code và gửi lệnh check-in. Vì trình duyệt client không kết nối trực tiếp được gRPC do giới hạn của HTTP/2 trong JavaScript browser, Next.js API Routes sẽ đóng vai trò gRPC Client (gateway) trung gian kết nối tới gRPC Server của Spring Boot.
3. Thực hiện k6 load test để đo đạc và báo cáo hiệu năng.

## Goals / Non-Goals

**Goals:**
- Thiết lập gRPC Server trên Spring Boot (port 50051) xử lý validate ticket và check-in.
- Tích hợp gRPC Client trong Next.js App Router (thông qua API route `/api/admin/check-in`).
- Giao diện Admin Scanner trên Next.js sử dụng Camera quét QR và hiển thị trạng thái check-in thời gian thực.
- Kịch bản Load test k6 giả lập 5,000 requests giữ ghế đồng thời, đo p95/p99 latency và error rate.

**Non-Goals:**
- Xây dựng app Android/iOS Native cho Scanner (chỉ làm Web App Scanner tối ưu trên Mobile Chrome/Safari).
- Tích hợp cổng thanh toán thật (giữ nguyên mô hình Mock Payment).

## Decisions

### 1. gRPC Server Integration in Spring Boot
- **Giải pháp:** Sử dụng `net.devh:grpc-server-spring-boot-starter:3.1.0.RELEASE` để tự động cấu hình gRPC server.
- **Protobuf Schema (`ticket.proto`):**
  ```protobuf
  syntax = "proto3";
  package ticket;
  option java_multiple_files = true;
  option java_package = "com.ticketrush.server.grpc";

  service TicketService {
      rpc CheckInTicket (CheckInRequest) returns (CheckInResponse);
  }

  message CheckInRequest {
      string ticketToken = 1;
      string adminSecret = 2;
  }

  message CheckInResponse {
      enum Status {
          UNKNOWN = 0;
          SUCCESS = 1;
          ALREADY_CHECKED_IN = 2;
          INVALID_TICKET = 3;
          UNAUTHORIZED = 4;
      }
      Status status = 1;
      string ticketId = 2;
      string concertTitle = 3;
      string seatNumber = 4;
      string attendeeName = 5;
      string checkedInAt = 6;
  }
  ```

### 2. Next.js API Route as gRPC Client Gateway
- **Lý do:** Client browser không hỗ trợ gRPC thuần trực tiếp (gRPC-web yêu cầu proxy phụ như Envoy). Next.js API Route sẽ hoạt động như một REST/JSON Gateway gọi gRPC Server của backend qua `@grpc/grpc-js` và `@grpc/proto-loader`.

### 3. QR Scanning Library in Next.js Client
- **Thư viện:** Sử dụng `html5-qrcode` vì tính gọn nhẹ, ổn định và chạy trực tiếp trên trình duyệt di động mà không cần compile native code.

### 4. Load Testing with k6
- **Kịch bản:**
  - `booking-load-test.js`: Đăng ký, đăng nhập, lấy danh sách concert, giữ ghế (mutation holdSeat).
  - Sử dụng local environment (Docker PostgreSQL trên 5433, Redis trên 6379, RabbitMQ trên 5672).
  - Thu thập metrics: `http_req_duration`, `checks` (phần trăm transaction thành công).

## Risks / Trade-offs

- **[Risk]** Camera API không hoạt động trên HTTP thường ở một số thiết bị di động.
  - **Mitigation:** Scanner Web App yêu cầu HTTPS hoặc localhost. Để test trên điện thoại thật kết nối máy tính dev, chúng ta sẽ hướng dẫn chạy thông qua Localhost/IP nội bộ hoặc sử dụng Cloudflare Tunnel (`cloudflared`) để cấp HTTPS miễn phí.
- **[Risk]** Port gRPC `50051` có thể bị xung đột hoặc bị firewall chặn.
  - **Mitigation:** Đảm bảo mở port này trên docker (nếu deploy container) hoặc chạy local process bình thường.
