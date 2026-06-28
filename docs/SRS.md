# Software Requirements Specification (SRS) - TicketRush

## 1. GIỚI THIỆU (Introduction)
Tài liệu SRS này mô tả chi tiết các yêu cầu chức năng (Functional Requirements) và phi chức năng (Non-functional Requirements) cho hệ thống **TicketRush**. Đối tượng sử dụng tài liệu này bao gồm Đội ngũ Phát triển Phần mềm, QA/Tester và Project Manager.

---

## 2. MÔ TẢ TỔNG QUAN (Overall Description)

### 2.1 Môi trường vận hành (Operating Environment)
*   **Hệ điều hành:** Linux/Windows/macOS (hỗ trợ Docker).
*   **Trình duyệt hỗ trợ:** Google Chrome, Mozilla Firefox, Safari, Microsoft Edge.
*   **Cơ sở dữ liệu:** PostgreSQL 16+, Redis 7+.
*   **Hàng đợi tin nhắn:** RabbitMQ 3.12+.

### 2.2 Tác nhân hệ thống (User Classes and Characteristics)
1.  **Khán giả (Buyer):** Người dùng có nhu cầu tìm hiểu concert, chọn ghế, giữ vé và thanh toán trực tuyến.
2.  **Nhân viên soát vé (Gate Keeper):** Sử dụng thiết bị chuyên dụng gọi gRPC Client để quét QR check-in tại cửa sự kiện.
3.  **Hệ thống (System/Cron):** Tự động quét và thu hồi các giao dịch quá hạn thanh toán.

---

## 3. YÊU CẦU CHỨC NĂNG (Functional Requirements)

### 3.1 Nhóm chức năng Đặt vé (Ticketing Workflow)
*   **F-01: Xem sơ đồ ghế (Interact Seat Map):**
    *   Hệ thống hiển thị sơ đồ concert dạng đồ họa SVG trực quan.
    *   Phân biệt trạng thái ghế bằng màu sắc.
*   **F-02: Giữ ghế (Hold Seat):**
    *   Người dùng chọn ghế và nhấn "Giữ ghế".
    *   Hệ thống khóa ghế trong 10 phút. Hiển thị đồng hồ đếm ngược.
*   **F-03: Tạo đơn hàng (Create Order):**
    *   Tạo đơn hàng nháp ở trạng thái `PENDING_PAYMENT`.
*   **F-04: Hủy đơn hàng tự động (Auto-Release Seat):**
    *   Hệ thống tự động giải phóng ghế và hủy đơn hàng nếu quá 10 phút không thanh toán.

### 3.2 Nhóm chức năng Thanh toán & Vé (Payment & Ticket)
*   **F-05: Giả lập thanh toán (Mock Payment):**
    *   Người dùng quét mã QR giả lập để thanh toán.
    *   Webhook cập nhật trạng thái đơn hàng thành `COMPLETED`.
*   **F-06: Phát hành vé (Ticket Generation):**
    *   Hệ thống tạo mã vé ngẫu nhiên (UUID/Hash bảo mật) và lưu trạng thái chưa check-in.
    *   Hiển thị mã QR tương ứng trên giao diện người dùng.

### 3.3 Nhóm chức năng Kiểm soát cửa (Gate Check-in)
*   **F-07: Soát vé qua gRPC (Verify Ticket):**
    *   Hệ thống nhận mã vé qua cổng gRPC.
    *   Kiểm tra tính hợp lệ của vé:
        *   Vé có tồn tại không?
        *   Vé đã được check-in trước đó chưa?
    *   Trả về thông tin kết quả (Đạt/Không Đạt, Tên chủ vé, Số ghế).
    *   Đánh dấu trạng thái vé là `CHECKED_IN` nếu hợp lệ.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

### 4.1 Hiệu năng (Performance)
*   **RPS:** Backend phải chịu tải được tối thiểu **2,000 requests/s** đối với API kiểm tra và giữ ghế.
*   **Thời gian phản hồi (Latency):**
    *   Thao tác giữ ghế (Hold Seat): p95 latency < **100ms**.
    *   gRPC Check-in API: p99 latency < **20ms**.
*   **Đồng bộ:** Trạng thái ghế thay đổi phải được phản hồi tới các client khác trong vòng **1 giây** qua WebSockets.

### 4.2 An toàn & Nhất quán (Safety & Consistency)
*   **Không Double Booking:** Tuyệt đối không cho phép 2 đơn hàng thanh toán thành công cho cùng một mã ghế.
*   **Idempotency:** API thanh toán phải idempotent. Nếu cùng một giao dịch gửi lại nhiều lần do lỗi mạng, hệ thống chỉ xử lý duy nhất 1 lần.

### 4.3 Khả năng mở rộng (Scalability)
*   Thiết kế stateless cho ứng dụng Spring Boot để có thể mở rộng nhiều instance sau Load Balancer.
*   Redis lưu trạng thái giữ ghế có cơ chế đồng bộ Cluster/Pub-Sub để hỗ trợ mở rộng cổng WebSocket Gateway.
