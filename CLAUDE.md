# CLAUDE.md - TicketRush Project Commands & Guidelines

Tài liệu này hướng dẫn cách chạy, kiểm thử, lint và build dự án TicketRush dành cho các AI Agents (Claude Code, Codex, Hermes).

---

## 🚀 LỆNH KHỞI CHẠY HẠ TẦNG (Infrastructure Commands)
Hạ tầng Docker Compose nằm ở thư mục gốc của dự án:
- **Khởi chạy container:** `docker compose up -d`
- **Dừng container:** `docker compose down`
- **Xóa volume (xóa sạch dữ liệu):** `docker compose down -v`
- **Kiểm tra logs:** `docker compose logs -f`

---

## ☕ BACKEND (Spring Boot) - Lệnh & Quy chuẩn

### 1. Lệnh thực thi (Chạy từ thư mục `/server`)
- **Khởi chạy ứng dụng:** `./mvnw spring-boot:run`
- **Chạy tất cả kiểm thử:** `./mvnw test`
- **Chạy một class kiểm thử cụ thể:** `./mvnw test -Dtest=ClassName`
- **Build dự án (chạy package):** `./mvnw clean package -DskipTests`
- **Xóa file build cũ:** `./mvnw clean`

### 2. Tiêu chuẩn code (Coding Standards)
- **Kiến trúc:** Monolith chia package rõ ràng theo Domain (ví dụ: `com.ticketrush.server.domain.user`, `com.ticketrush.server.domain.seat`).
- **Lombok:** Sử dụng `@Data`, `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` để giảm boilerplate code.
- **GraphQL:** Định nghĩa Schema-first trong `src/main/resources/graphql/schema.graphqls`. Tạo Controller với `@QueryMapping`, `@MutationMapping`, `@SubscriptionMapping`.
- **gRPC:** Đặt file `.proto` trong `/server/src/main/proto/`. Build package để tự động compile gRPC Java class bằng Maven protobuf plugin.

---

## ⚡ FRONTEND (Next.js) - Lệnh & Quy chuẩn

### 1. Lệnh thực thi (Chạy từ thư mục `/client`)
- **Cài đặt dependency:** `pnpm install`
- **Khởi chạy dev server:** `pnpm dev`
- **Build dự án:** `pnpm build`
- **Chạy linter:** `pnpm lint`
- **Chạy kiểm thử:** `pnpm test` (nếu có setup Jest/Vitest)

### 2. Tiêu chuẩn code (Coding Standards)
- **TypeScript:** Định nghĩa type rõ ràng, **không sử dụng `any`**.
- **Next.js App Router:** Đặt các routes/pages trong thư mục `app/`.
- **GraphQL Client:** Sử dụng `@apollo/client` để query/mutation và WebSocket link cho subscriptions.
- **Styling:** Sử dụng Tailwind CSS, viết UI dark mode hiện đại, responsive.

---

## 🤖 CO-WORKING WORKFLOW RULES (Phối hợp AI Agents)

### 1. Phân vai thực thi:
- **Claude Code (Sonnet/Opus):** Sử dụng cho tác vụ planning, thiết kế kiến trúc, giải quyết logic thuật toán phức tạp (ví dụ: Lua script, RabbitMQ config, GraphQL subscriptions).
- **Codex (OpenAI):** Sử dụng để thực thi các task nhỏ, sửa lỗi cú pháp (syntax errors), fix các vấn đề phát hiện trong logs.
- **Hermes Agent (Orchestrator):** Điều phối, quản lý hạ tầng Docker, kiểm tra definition of done (DoD) và thực hiện các thao tác git/push.

### 2. Quy trình làm việc (Strict rules):
- Trước khi code bất kỳ tính năng lớn nào, bắt buộc phải viết **Implementation Plan** lưu tại `.hermes/plans/`.
- Chạy `./mvnw test` (backend) và `pnpm lint` (frontend) trước khi commit.
- Nhánh làm việc mặc định: Code trên nhánh `dev`. Sau khi hoàn thành tính năng và test pass, merge vào `main` và push lên GitHub.
- Format git commit tuân theo Conventional Commits (ví dụ: `feat: add auth resolver`, `fix: resolve redis connection leak`).
