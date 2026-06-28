# Lộ Trình Phát Triển Agile / Scrum - TicketRush

Dự án **TicketRush** được vận hành theo mô hình Agile/Scrum rút gọn, chia làm **4 Sprints** (mỗi Sprint dự kiến kéo dài 1-2 tuần). Lộ trình này tập trung vào việc hoàn thiện từng phần tính năng độc lập, có thể chạy thử nghiệm và kiểm thử ngay sau mỗi Sprint.

---

## 📅 BẢNG TỔNG QUAN CÁC SPRINT (Sprint Board Overview)

| Sprint | Mục tiêu chính | Trọng tâm công nghệ | Kết quả mong đợi (Deliverable) |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Hạ tầng & Authentication | Docker Compose, Spring Security, JWT, JPA | Chạy được container, đăng ký/đăng nhập qua GraphQL |
| **Sprint 2** | Concurrency Seat Holding Engine | Redis (Lua Script), RabbitMQ Delayed Exchange | Đặt giữ ghế an toàn dưới luồng multi-threads |
| **Sprint 3** | GraphQL Real-time & Web Client | WebSockets Subscription, Next.js, SVG Map | Sơ đồ ghế cập nhật real-time khi click giữ ghế |
| **Sprint 4** | gRPC Soát Vé & Load Testing | gRPC Server/Client, k6 Load Test, Camera Scan | Quét QR qua camera soát vé, báo cáo benchmark |

---

## 📋 CHI TIẾT CÁC TASK THEO SPRINT

### 🔄 Sprint 1: Setup Infrastructure, Database & Core Auth
*   **Mục tiêu:** Thiết lập toàn bộ môi trường chạy thực tế, thiết kế các thực thể database, cấu hình kết nối JPA và dựng API Đăng nhập/Đăng ký.
*   **Danh sách Task chi tiết:**
    *   [x] **Task 1.1:** Khởi chạy `docker-compose.yml` (Postgres, Redis, RabbitMQ với delayed plugin). Kiểm tra trạng thái hoạt động của các service.
    *   [x] **Task 1.2:** Thiết lập cấu hình kết nối database trong `application.properties` của Spring Boot.
    *   [x] **Task 1.3:** Định nghĩa các JPA Entities (`User`, `Concert`, `SeatZone`, `Seat`, `Order`, `Ticket`) và sinh schema tự động vào PostgreSQL.
    *   [x] **Task 1.4:** Thiết lập Spring Security, cấu hình JWT Token Provider và Authentication Filter.
    *   [x] **Task 1.5:** Định nghĩa Schema GraphQL cho Auth (`register`, `login`) và viết Resolvers tương ứng.
*   **Tiêu chí hoàn thành (DoD):**
    *   Các container Docker khởi chạy thành công không bị restart.
    *   Truy cập được GraphQL Playground / GraphiQL ở backend để đăng ký và đăng nhập nhận về JWT thành công.

---

### ⚡ Sprint 2: High-Concurrency Seat Holding Engine (Trọng tâm Backend)
*   **Mục tiêu:** Hiện thực hóa trái tim của hệ thống: Luồng đặt giữ ghế siêu tốc bằng Redis và tự động giải phóng thông minh qua RabbitMQ Delayed Exchange.
*   **Danh sách Task chi tiết:**
    *   [x] **Task 2.1:** Cấu hình Redis Connection Pool trong Spring Boot. Viết Redis Service nạp sơ đồ ghế trống (Set) khi tạo/mở sự kiện.
    *   [x] **Task 2.2:** Viết file Lua Script cho Redis để kiểm tra ghế trống và thực hiện hold ghế nguyên tử (Atomic). Tích hợp chạy script từ Spring Boot.
    *   [x] **Task 2.3:** Cấu hình RabbitMQ Connection và định nghĩa Delayed Message Exchange.
    *   [x] **Task 2.4:** Viết service gửi message hẹn giờ 10 phút khi giữ ghế thành công.
    *   [x] **Task 2.5:** Viết Expiration Consumer để nhận message sau 10 phút, kiểm tra đơn hàng và thực hiện hoàn trả ghế trống về Redis & DB.
    *   [x] **Task 2.6:** Viết các Unit Test chạy đồng thời nhiều luồng (Concurrency Tests) bằng `CountDownLatch` hoặc `Testcontainers` để chứng minh 0% trùng ghế dưới tải lớn.
*   **Tiêu chí hoàn thành (DoD):**
    *   Test đặt ghế đồng thời chạy pass, không xảy ra hiện tượng overselling hoặc double booking.
    *   Hết 10 phút không thanh toán, ghế tự động trống trở lại trên Redis và DB.

---

### 🌐 Sprint 3: GraphQL Real-time & Web Client (Next.js & SVG Map)
*   **Mục tiêu:** Xây dựng giao diện Next.js Web Client sống động, tích hợp sơ đồ ghế SVG và cơ chế đồng bộ real-time WebSocket.
*   **Danh sách Task chi tiết:**
    *   [x] **Task 3.1:** Cấu hình WebSocket Transport cho Spring for GraphQL để hỗ trợ Subscription (`spring.graphql.websocket.path`). Viết `GraphQlAuthInterceptor` (implements `WebSocketGraphQlInterceptor`) để xác thực JWT trên kết nối WebSocket.
    *   [x] **Task 3.2:** Thêm GraphQL Subscription vào schema (`seatStatusUpdated`) và triển khai `SeatEventPublisher` (Reactor `Sinks.many().multicast()`) để broadcast realtime.
    *   [x] **Task 3.3:** Cập nhật `BookingService` và `ExpirationMessageConsumer` để publish event `HELD`/`AVAILABLE` qua `SeatEventPublisher`.
    *   [x] **Task 3.4:** Bổ sung `getConcertDetail` Query trong GraphQL Schema và `ConcertGraphQLController` để lấy toàn bộ sơ đồ ghế của một Concert.
    *   [x] **Task 3.5:** Khởi tạo Next.js 16 Client với Apollo Provider, cấu hình `HttpLink + GraphQLWsLink` split theo loại operation. Viết `AuthContext` quản lý JWT, `ApolloWrapper` bọc toàn bộ app.
    *   [x] **Task 3.6:** Dựng màn hình Đăng nhập/Đăng ký đẹp (dark theme, Tailwind CSS).
    *   [x] **Task 3.7:** Thiết kế giao diện sơ đồ ghế SVG tương tác, tích hợp GraphQL Subscription real-time để tự động cập nhật màu sắc ghế ngay khi user khác hold.
    *   [x] **Task 3.8:** Xây dựng trang Mock Payment hiển thị QR code giả lập, simulate thanh toán và render vé QR code hoàn chỉnh sau khi payment success.
*   **Tiêu chí hoàn thành (DoD):**
    *   `./mvnw test` pass 3/3 tests (bao gồm test concurrency hold + event broadcast).
    *   `pnpm build` Next.js build thành công không có lỗi.
    *   Hai trình duyệt khác nhau mở cùng concert có thể thấy trạng thái ghế thay đổi real-time qua GraphQL Subscription/WebSocket.
    *   Thanh toán thành công xuất ra vé QR code trên màn hình.

---

### 🛡️ Sprint 4: gRPC Scanner, Load Test & Deployment
*   **Mục tiêu:** Xây dựng luồng soát vé B2B bằng gRPC, kiểm thử chịu tải thực tế của hệ thống bằng k6 và đóng gói tài liệu dự án.
*   **Danh sách Task chi tiết:**
    *   [ ] **Task 4.1:** Định nghĩa file protobuf `ticket.proto` và cấu hình Maven plugin tự động compile sang Java classes.
    *   [ ] **Task 4.2:** Viết gRPC Server Service xử lý check-in vé trên Spring Boot.
    *   [ ] **Task 4.3:** Xây dựng giao diện Web Admin Scanner trên Next.js (yêu cầu quyền Camera, quét QR Code) và gọi API Route (đóng vai trò gRPC Client) kết nối tới gRPC Server của backend.
    *   [ ] **Task 4.4:** Viết script load test k6 giả lập 5,000 requests đặt vé đồng thời.
    *   [ ] **Task 4.5:** Thực hiện load test, đo đạc chỉ số RPS, latency p95/p99 và lưu kết quả vào README.
*   **Tiêu chí hoàn thành (DoD):**
    *   Dùng điện thoại quét QR trên màn hình máy tính check-in thành công qua cổng gRPC, đổi trạng thái vé sang `CHECKED_IN`.
    *   Có báo cáo load test chi tiết chứng minh hệ thống đạt tối thiểu 2,000 RPS.
