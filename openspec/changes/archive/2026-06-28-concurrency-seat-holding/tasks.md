## 1. Redis Caching & Lua Script Setup

- [ ] 1.1 Thêm dependency `commons-pool2` vào `pom.xml` của backend và cấu hình Redis connection pool trong `application.properties`
- [ ] 1.2 Viết file Lua Script để thực hiện hold ghế nguyên tử và lưu tại `src/main/resources/scripts/hold_seat.lua`
- [ ] 1.3 Viết file Lua Script để giải phóng ghế bị lock và lưu tại `src/main/resources/scripts/release_seat.lua`
- [ ] 1.4 Tạo class `RedisReservationService` nạp sơ đồ ghế (Set) khi bắt đầu sự kiện và chạy Lua Script để lock/unlock

## 2. RabbitMQ Delayed Expiration Configuration

- [ ] 2.1 Cấu hình RabbitMQ Connection, Delayed Exchange (`x-delayed-message`) và Queue trong Spring Boot
- [ ] 2.2 Tạo `ExpirationMessageProducer` gửi message kèm header trì hoãn `x-delay` (10 phút)
- [ ] 2.3 Tạo `ExpirationMessageConsumer` nhận message trì hoãn, kiểm tra trạng thái order, cập nhật PostgreSQL và gọi giải phóng ghế trên Redis

## 3. Core Booking Business Implementation

- [ ] 3.1 Cấu hình GraphQL schema mở rộng với Mutation `holdSeat(seatId: ID!): Order!`
- [ ] 3.2 Viết JpaRepositories cho Concert, SeatZone, Seat, Order, Ticket
- [ ] 3.3 Viết `BookingService` liên kết luồng: kiểm tra/lock Redis -> tạo Order nháp trong DB -> gửi RabbitMQ delayed message
- [ ] 3.4 Viết resolver/controller GraphQL tiếp nhận request holdSeat và map context user đã đăng nhập

## 4. Concurrency Verification & Testing

- [ ] 4.1 Viết integration test sử dụng `CountDownLatch` để giả lập 50-100 luồng concurrent cùng click mua 1 ghế duy nhất
- [ ] 4.2 Viết integration test kiểm tra luồng RabbitMQ Expiration tự động release ghế sau thời gian delay
- [ ] 4.3 Chạy tất cả test suite và đảm bảo build thành công không lỗi tranh chấp
