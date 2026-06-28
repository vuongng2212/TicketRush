## 1. Setup Infrastructure

- [ ] 1.1 Khởi chạy docker-compose.yml và xác minh các service Postgres, Redis, RabbitMQ hoạt động bình thường
- [ ] 1.2 Kiểm tra sự hiện diện của plugin rabbitmq_delayed_message_exchange trong container RabbitMQ

## 2. Configuration & JPA Domain Entities

- [ ] 2.1 Cập nhật pom.xml của backend với các dependency cần thiết (Spring Security, JWT, Spring for GraphQL, Validator)
- [ ] 2.2 Định nghĩa các JPA Entities Core (User, Concert, SeatZone, Seat, Order, Ticket) trong project Spring Boot
- [ ] 2.3 Cấu hình `application.properties` để kết nối PostgreSQL và bật tự động cập nhật schema
- [ ] 2.4 Khởi chạy thử ứng dụng Spring Boot và xác nhận bảng được tạo thành công trong PostgreSQL

## 3. Spring Security & JWT Implementation

- [ ] 3.1 Viết class tiện ích JWT (`JwtTokenProvider`) hỗ trợ sinh và verify token
- [ ] 3.2 Viết `JwtAuthenticationFilter` để chặn các request, lấy và xác thực JWT token từ Authorization header
- [ ] 3.3 Thiết lập cấu hình Spring Security (`SecurityConfig`) tắt csrf, stateless session, và cấu hình phân quyền endpoint `/graphql`

## 4. GraphQL Schema & Resolvers (Auth)

- [ ] 4.1 Định nghĩa file schema GraphQL `src/main/resources/graphql/schema.graphqls` với User type, auth query/mutation
- [ ] 4.2 Viết GraphQL Resolvers cho mutation `register` (mã hóa password bằng BCrypt) và `login` (verify password, sinh JWT)
- [ ] 4.3 Viết Exception Handler để xử lý lỗi authentication và format trả về dạng lỗi GraphQL chuẩn
- [ ] 4.4 Thực hiện kiểm thử đăng ký, đăng nhập qua GraphQL Playground và xác nhận token trả về đúng
