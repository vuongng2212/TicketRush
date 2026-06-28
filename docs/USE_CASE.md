# Use Case Specification - TicketRush

## 1. BIỂU ĐỒ USE CASE TỔNG QUAN (Use Case Diagram Description)
Hệ thống bao gồm 3 tác nhân chính tương tác trực tiếp:
1.  **Khán giả (Buyer):** Xem sơ đồ ghế, Giữ ghế, Thanh toán đơn hàng, Xem mã vé.
2.  **Nhân viên soát vé (Gate Keeper):** Quét mã QR, Xác thực vé.
3.  **Hệ thống (System):** Tự động thu hồi vé hết hạn thanh toán, Gửi cập nhật trạng thái ghế real-time.

---

## 2. CHI TIẾT CÁC USE CASE CHÍNH (Key Use Cases)

### UC-01: Giữ Ghế Tạm Thời (Hold Seat)
*   **Tác nhân chính:** Khán giả (Buyer).
*   **Mục tiêu:** Khóa tạm thời 1 hoặc nhiều ghế để chuẩn bị thanh toán, tránh người khác mua mất.
*   **Tiền điều kiện:** Khán giả đã đăng nhập vào hệ thống và đang xem sơ đồ ghế của một concert đang mở bán (`status = OPEN`).
*   **Luồng sự kiện chính (Basic Flow):**
    1. Khán giả click vào một ghế trống (Màu xanh) trên sơ đồ Next.js.
    2. Next.js gửi yêu cầu GraphQL Mutation `holdSeat(seatId)`.
    3. Backend Spring Boot tiếp nhận và chạy Lua Script kiểm tra trạng thái ghế trên Redis.
    4. Lua Script xác nhận ghế trống, thực hiện xóa khỏi danh sách trống và chuyển sang trạng thái HELD (gắn với userId).
    5. Backend Spring Boot tạo bản ghi `Seat` (HELD) và `Order` (PENDING_PAYMENT) trong PostgreSQL.
    6. Backend phản hồi thành công về Next.js.
    7. Backend phát sự kiện GraphQL Subscription thông báo ghế đã bị giữ.
    8. Giao diện Next.js của tất cả người dùng đổi màu ghế đó sang màu Cam (Hold).
*   **Luồng thay thế (Alternative Flow - Ghế đã bị chọn):**
    *   *Tại bước 4:* Lua Script phát hiện ghế đã bị giữ bởi user khác (không còn trong Set `available` trên Redis).
    *   *Bước 5:* Trả về lỗi `"Seat is already held or sold"`.
    *   *Bước 6:* Giao diện Next.js hiển thị thông báo lỗi và đổi màu ghế sang màu xám/cam.
*   **Hậu điều kiện:** Ghế được giữ trong 10 phút, đơn hàng nháp được tạo.

---

### UC-02: Hủy Vé Hết Hạn Tự Động (Auto-Release Seat)
*   **Tác nhân chính:** Hệ thống (System / Message Queue).
*   **Mục tiêu:** Thu hồi vé đã quá hạn thanh toán để nhường cơ hội cho người khác.
*   **Tiền điều kiện:** Ghế đã được giữ thành công (UC-01) và Message trì hoãn (Delayed Message) đã được đẩy vào RabbitMQ.
*   **Luồng sự kiện chính (Basic Flow):**
    1. Sau 10 phút kể từ lúc giữ ghế, RabbitMQ chuyển giao message chứa `orderId` cho Consumer.
    2. Backend Spring Boot nhận message và truy vấn database kiểm tra trạng thái của `Order`.
    3. Hệ thống xác nhận trạng thái đơn hàng vẫn là `PENDING_PAYMENT`.
    4. Hệ thống cập nhật trạng thái đơn hàng thành `EXPIRED` trong PostgreSQL.
    5. Hệ thống gọi Redis giải phóng ghế (xóa khỏi Hash `held`, đẩy trả lại Set `available`).
    6. Hệ thống cập nhật trạng thái ghế thành `AVAILABLE` trong PostgreSQL.
    7. Hệ thống phát sự kiện cập nhật trạng thái ghế qua GraphQL Subscription.
    8. Giao diện của tất cả người dùng chuyển màu ghế đó về màu xanh lá (Available).
*   **Hậu điều kiện:** Ghế trống trở lại, đơn hàng bị hủy vĩnh viễn.

---

### UC-03: Soát Vé Tại Cổng (Verify Ticket)
*   **Tác nhân chính:** Nhân viên soát vé (Gate Keeper).
*   **Mục tiêu:** Xác thực vé của khán giả khi vào cổng concert thông qua giao thức gRPC.
*   **Tiền điều kiện:** Khán giả đưa mã QR Code chứa `ticketCode` cho nhân viên soát vé.
*   **Luồng sự kiện chính (Basic Flow):**
    1. Nhân viên soát vé dùng thiết bị cầm tay quét QR Code.
    2. Thiết bị gửi request gRPC `VerifyTicket(ticketCode)` đến port 50051 của Spring Boot.
    3. Spring Boot gRPC Server tiếp nhận request và truy vấn database tìm `Ticket` theo `ticketCode`.
    4. Hệ thống xác nhận vé hợp lệ (`status = COMPLETED` và `checkInStatus = FALSE`).
    5. Hệ thống cập nhật `checkInStatus = TRUE` và ghi nhận `checkInTime`.
    6. gRPC Server trả về response: `valid = TRUE`, thông tin ghế và tên người dùng.
    7. Thiết bị quét hiển thị màn hình xanh lá: *"Hợp lệ. Mời vào!"*.
*   **Luồng ngoại lệ 1 (Vé không tồn tại):**
    *   *Tại bước 4:* Không tìm thấy vé. Trả về `valid = FALSE`, `message = "Vé không hợp lệ hoặc không tồn tại"`.
*   **Luồng ngoại lệ 2 (Vé đã sử dụng):**
    *   *Tại bước 4:* Phát hiện `checkInStatus = TRUE`. Trả về `valid = FALSE`, `message = "Vé đã được sử dụng lúc [Time]"`.
*   **Hậu điều kiện:** Vé hợp lệ được đánh dấu đã check-in, không thể tái sử dụng.
