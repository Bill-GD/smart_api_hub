# 📝 Long Assignment: Smart API Hub

**Hình thức:** Cá nhân
**Thời gian:** 1 tuần
**Mục tiêu:** Xây dựng một REST API Platform tự động sinh API từ file `schema.json`.

---

## 🛠 Tech Stack Bắt Buộc

- **Node.js (≥ 20), TypeScript (Strict Mode), Express.js**
- **PostgreSQL (≥ 15), Knex.js** (Có thể dùng ORM như Prisma/TypeORM thay thế)
- **Zod, JWT/Bcrypt**
- **Vitest + Supertest, Docker/Docker-compose**

---

## 📋 Yêu Cầu Chức Năng (Checklist)

### 1. Khởi tạo & Auto-Migration (1đ)

- [x] Chạy từ file `schema.json` tự chọn (tối thiểu 3 bảng có liên kết, bảng `users` phải có `email`, `password`,
  `role`).
- [x] Tự động nội suy kiểu dữ liệu và tạo bảng PostgreSQL nếu chưa có.
- [x] Endpoint `GET /health` trả về status và ping DB thật.
- [x] Tự động update `updated_at`.

### 2. Dynamic CRUD (2đ)

- [x] **GET `/:resource`**: Lọc các field với `?_fields=col1,col2`.
- [x] **POST `/:resource`**
- [x] **PUT / PATCH / DELETE `/:resource/:id`**:
  - [x] Khác biệt chuẩn giữa PUT (thay toàn bộ) vs PATCH (cập nhật 1 phần).
  - [x] Whitelist validate input `tableName` (chống SQL Injection).

### 3. Advanced Query (1.5đ)

- [x] **Pagination & Sorting**: `_page`, `_limit`, `_sort`, `_order` (trả về header `X-Total-Count`).
- [x] **Filtering**: `_gte`, `_lte`, `_ne`, `_like`, `_eq`, `_lt`, `_gt`.
- [x] **Full Text Search**: `?q=keyword` tìm kiếm trên các cột text.

### 4. Relationships (Tối ưu N+1 Query) (1.5đ)

- [x] **Expand**: `GET /:resource?_expand=parentResource` (Lấy dữ liệu cha).
- [x] **Embed**: `GET /:resource?_embed=childResource` (Lấy dữ liệu con).

### 5. Authentication & Authorization (1.5đ)

- [x] `POST /auth/register` (hash password) & `POST /auth/login` (cấp JWT).
- [x] Middleware bảo vệ routes: **Write (C/U/D)** → Cần Token (User); **DELETE** → Chỉ `admin` được xoá.

### 6. Production Ready (1.5đ)

- [x] **Global Error Handler**: Bắt lỗi server, DB không bị crash. Response chuẩn `{ "error": "message" }`.
- [x] **Validation (Zod)**: Bắt buộc check format ở Register, Login và các POST/PUT endpoints. Trả HTTP 400.
- [x] **Testing**: Viết tối thiểu **10 Test Cases** (Vitest + Supertest) cover đủ Happy path, Lỗi 400/401/403/404.

### 7. Deployment & Docs API (1đ)

- [x] Deploy app bằng **Docker** thông qua `Dockerfile`.
- [ ] ~~Thiết lập `docker-compose.yaml` gộp chung Nodejs app + Postgresql.~~
- [ ] `README.md` hướng dẫn chạy chi tiết và vẽ **Mermaid Architecture Diagram**.
- [ ] Export bộ **Postman Collection** đầy đủ.
- [x] Swagger UI

---

## 🚀 Tính Năng Bonus (Chọn ≥ 1) (+1đ/tính năng)

### [A] Rate Limiting (Tự viết cấp độ Middleware) ✅

- **Mô tả:** Chống spam request bằng cách tự viết logic giới hạn (dùng In-memory Object/Map, **không
  ** dùng thư viện có sẵn).
- **Yêu cầu:** Giới hạn tối đa **100 request / 1 phút / 1 IP**.
- **Kết quả:** Vượt ngưỡng trả về lỗi `429 Too Many Requests`. (Nên có thêm Headers như `X-RateLimit-Limit` và
  `X-RateLimit-Remaining`).

### [B] Response Caching (Tối ưu Hiệu năng)

- **Mô tả:** Giảm tải database bằng cách lưu bộ đệm cho các request đọc dữ liệu.
- **Yêu cầu:** Lưu Cache in-memory các lệnh `GET` với tuổi thọ (TTL) là **30 giây**.
- **Invalidation:
  ** Bắt buộc phải tự động xoá cache của một resource cụ thể ngay khi có hành động ghi (POST/PUT/PATCH/DELETE) vào resource đó.

### [C] Audit Log (Lưu vết Hệ thống)

- **Mô tả:** Theo dõi lịch sử những ai đã can thiệp thay đổi dữ liệu trong hệ thống.
- **Yêu cầu:** Bắt sự kiện thao tác Write (C/U/D) thành công.
- **Kết quả:** Ghi tự động một dòng vào bảng `audit_logs` (lưu ngầm không block luồng response) chứa: `user_id`,
  `action (CREATE/UPDATE/DELETE)`, `resource_name`, `record_id`, `timestamp`.

---

## 📤 Tiêu Chí Nộp Bài

- Upload **GitHub public** `smart-api-hub` chứa: Source code, `Dockerfile`, `docker-compose.yaml`,
  `.env.example` (cấm push `.env`).
- Code sạch, commit message gọn gàng, có thể clone về gõ `docker-compose up` là chạy.
