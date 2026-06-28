# Business Requirements Document (BRD) - TicketRush

## 1. GIỚI THIỆU (Introduction)
Dự án **TicketRush** là một nền tảng bán vé sự kiện âm nhạc (Concert E-Ticketing) trực tuyến tốc độ cao, được thiết kế để giải quyết vấn đề nghẽn mạng, quá tải cơ sở dữ liệu và tình trạng bán trùng vé (Double Booking) khi mở bán các concert quy mô lớn (Flash Sale).

---

## 2. BỐI CẢNH & VẤN ĐỀ DOANH NGHIỆP (Business Context & Problem Statement)
Khi các nghệ sĩ nổi tiếng tổ chức sự kiện, hàng chục ngàn người hâm mộ cùng truy cập vào hệ thống tại một thời điểm (ví dụ: đúng 12:00 trưa) để săn một số lượng vé giới hạn. Các hệ thống e-commerce truyền thống thường gặp các vấn đề:
1. **Database Lock & Crash:** Quá nhiều request ghi (write) đồng thời vào bảng ghế (Seats) gây deadlock và làm sập cơ sở dữ liệu.
2. **Double Booking:** Do tranh chấp dữ liệu (Race Condition), hai hoặc nhiều người dùng cùng thanh toán thành công cho một ghế duy nhất.
3. **Vé "Ảo" (Cart Abandonment):** Người dùng giữ vé trong giỏ hàng nhưng không thanh toán, khiến hệ thống báo hết vé ảo, gây tổn thất doanh thu cho ban tổ chức.

---

## 3. MỤC TIÊU CHIẾN LƯỢC (Business Objectives)
- **Tối ưu hóa doanh thu:** Đảm bảo toàn bộ số vé được bán hết nhanh nhất, không có tình trạng giữ vé ảo kéo dài.
- **Trải nghiệm khách hàng tin cậy:** Hệ thống không sập, phản hồi trạng thái đặt vé nhanh chóng (< 200ms đối với thao tác chọn ghế).
- **Hạn chế tối đa lỗi nghiệp vụ:** Tỉ lệ bán trùng ghế (Double Booking) bắt buộc phải là **0%**.
- **Giải pháp B2B đồng bộ:** Cung cấp giải pháp soát vé tại cổng sự kiện nhanh gọn, giảm thiểu thời gian xếp hàng của khán giả.

---

## 4. PHẠM VI DỰ ÁN (Project Scope)

### Trong phạm vi (In-Scope)
*   **Trang thông tin sự kiện & sơ đồ ghế:** Hiển thị chi tiết concert và sơ đồ ghế tương tác dạng SVG.
*   **Hệ thống giữ ghế tạm thời (Ticket Holding):** Cho phép giữ ghế tối đa 10 phút để thực hiện thanh toán.
*   **Thanh toán giả lập:** Tích hợp cổng thanh toán mô phỏng (Mock Payment) để xác nhận giao dịch.
*   **Soát vé tốc độ cao (Ticket Checking):** Cung cấp API gRPC cho thiết bị cầm tay tại cổng soát vé để quét mã QR và check-in.
*   **Cập nhật real-time:** Đồng bộ hóa trạng thái ghế trống/đang giữ/đã bán tới tất cả khách hàng đang xem sơ đồ.

### Ngoài phạm vi (Out-of-Scope)
*   Tích hợp thanh toán thật với các ngân hàng hoặc cổng MOMO/VNPAY thật (chỉ dùng Mock API).
*   Hệ thống gợi ý chỗ ngồi thông minh (Seat Recommendation AI).
*   Quản lý kế toán và xuất hóa đơn đỏ (VAT Invoice generation).

---

## 5. CÁC YÊU CẦU NGHIỆP VỤ CHÍNH (Key Business Requirements)

| ID | Yêu cầu nghiệp vụ | Mô tả chi tiết | Độ ưu tiên |
| :--- | :--- | :--- | :--- |
| **BR-01** | Giữ ghế tạm thời | Cho phép người dùng chọn và giữ ghế tối đa 10 phút. Quá thời gian này ghế phải tự động mở khóa. | High |
| **BR-02** | Chống trùng ghế | Đảm bảo một ghế tại một thời điểm chỉ được giữ hoặc mua bởi duy nhất một tài khoản. | Critical |
| **BR-03** | Thanh toán & Phát hành vé | Sau khi thanh toán thành công, hệ thống tạo mã vé dạng QR Code bảo mật gửi về cho người dùng. | High |
| **BR-04** | Đồng bộ real-time | Khi một ghế chuyển sang trạng thái "Hold" hoặc "Sold", sơ đồ ghế của toàn bộ người dùng khác phải cập nhật ngay lập tức mà không cần F5. | High |
| **BR-05** | Soát vé tại cổng | Ban tổ chức quét QR Code để kiểm tra vé hợp lệ. Tốc độ kiểm tra phải cực nhanh (< 50ms) để tránh ùn tắc. | Medium |
| **BR-06** | Hàng chờ ảo (Virtual Waiting Room) | Khi lượng truy cập vượt quá ngưỡng chịu tải, đưa user vào hàng đợi FIFO thay vì báo lỗi sập server. | Medium |

---

## 6. TIÊU CHÍ NGHIỆM THU (Success Criteria & Acceptance Criteria)
*   **Tính nhất quán:** 0 trường hợp trùng ghế được ghi nhận trong cơ sở dữ liệu.
*   **Kháng tải:** Hệ thống chịu được tối thiểu **2,000 requests/giây (RPS)** trên môi trường kiểm thử mà không bị sập hay mất mát dữ liệu.
*   **Tốc độ phản hồi:** Thời gian phản hồi API giữ ghế trung bình (p95 latency) dưới **150ms**.
