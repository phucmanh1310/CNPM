# Chiến lược CI/CD và Giám sát Hệ thống

Đây là tài liệu phác thảo hiện trạng của hệ thống CI/CD và giám sát cho ứng dụng Giao đồ ăn, đồng thời cung cấp một kế hoạch hành động chi tiết để xây dựng một hệ thống hoàn toàn tự động, an toàn và có khả năng quan sát cao.

---

## 1. Phân tích Hiện trạng

### A. Điểm mạnh

- ✅ **Container hóa Xuất sắc**: Cả Backend và Frontend đều có `Dockerfile` chuyên nghiệp, sử dụng multi-stage builds, người dùng non-root và tối ưu hóa cache.
- ✅ **Môi trường Test Chuyên nghiệp**: File `docker-compose.test.yml` cung cấp một môi trường test nhanh, biệt lập và nhất quán, hoàn hảo cho các pipeline CI.
- ✅ **Giám sát Sức khỏe Cơ bản**: `HEALTHCHECK` đã được tích hợp vào cả hai dịch vụ, cho phép các nền tảng triển khai tự động phát hiện và khởi động lại các container không khỏe mạnh.
- ✅ **Nền tảng Triển khai**: Dự án đã được thiết lập để triển khai trên Railway.

### B. Điểm yếu & Rủi ro Nghiêm trọng

- 🚨 **LỖ HỔNG BẢO MẬT NGHIÊM TRỌNG**: Toàn bộ thông tin nhạy cảm (mật khẩu database, JWT secret, API keys) đang được viết cứng (hardcode) trực tiếp trong file `docker-compose.yml`. Đây là vấn đề cần được ưu tiên khắc phục hàng đầu.
- ❌ **QUY TRÌNH TRIỂN KHAI BỊ LỖI**: Cấu hình `railway.json` hiện tại chỉ cài đặt dependencies. Nó **không chạy test** và **không build frontend cho môi trường production**. Ứng dụng được triển khai có khả năng đang chạy ở chế độ development, không được tối ưu và chưa được kiểm thử.
- ❌ **CHƯA CÓ PIPELINE CI/CD HOÀN CHỈNH**: Các bước `test`, `build`, và `deploy` đang bị rời rạc. Chưa có một quy trình tự động (ví dụ: GitHub Actions) để kết nối các bước này lại với nhau mỗi khi có code mới được đẩy lên.
- ⚠️ **GIÁM SÁT CÒN SƠ KHAI**: Việc giám sát chỉ dừng lại ở mức kiểm tra sức khỏe cơ bản. Chưa có hệ thống tập trung để ghi log, theo dõi chỉ số (CPU, RAM, thời gian phản hồi), hay thiết lập cảnh báo.

---

## 2. Kế hoạch Hành động: Xây dựng Hệ thống CI/CD và Giám sát Toàn diện

### A. Mục tiêu

Tự động hóa hoàn toàn quy trình từ lúc đẩy code lên Git cho đến khi triển khai thành công lên production, đảm bảo mọi thay đổi đều được tự động kiểm thử, build và triển khai một cách an toàn, đồng thời cung cấp khả năng quan sát sức khỏe của hệ thống.

### B. Phương pháp & Công cụ

- **Điều phối CI/CD**: **GitHub Actions**.
- **Nền tảng Triển khai**: **Vercel(FE) + Render(BE)**.
- **Quản lý Bí mật**: **GitHub Actions Secrets**.
- **Giám sát & Cảnh báo**: **Các công cụ tích hợp sẵn**.

### C. Hướng dẫn Triển khai Chi tiết

#### Bước 1: Khắc phục Lỗ hổng Bảo mật (Ưu tiên Cao nhất)

1.  **Tạo file `.env`**: Tạo các file `BackEnd/.env` và `FrontEnd/.env` để lưu trữ các biến nhạy cảm.
2.  **Cập nhật `.gitignore`**: Thêm `*.env` vào file `.gitignore` ở thư mục gốc.
3.  **Cập nhật `docker-compose.yml`**: Sửa đổi mỗi dịch vụ để sử dụng `env_file` nhằm tải biến môi trường cho môi trường phát triển cục bộ.
4.  **Cấu hình Bí mật trên Production**: Thêm tất cả các biến môi trường cần thiết một cách an toàn trong phần cài đặt dịch vụ trên dashboard của Railway.

#### Bước 2: Xây dựng Pipeline CI/CD với GitHub Actions

Tạo một file workflow tại `.github/workflows/ci-cd.yml`.

**Cách Pipeline Hoạt động:**

1.  **Kích hoạt (Trigger)**: Pipeline tự động khởi chạy mỗi khi có push lên nhánh `main`.
2.  **Job `test`**: Checkout code và chạy cả test cho backend và frontend bằng `docker-compose.test.yml`. Nếu có bất kỳ test nào thất bại, pipeline sẽ dừng lại.
3.  **Job `deploy`**: Chỉ khi tất cả các test đều thành công, job này sẽ kết nối đến Railway bằng token an toàn, sau đó build và triển khai ứng dụng bằng các `Dockerfile` đã sẵn sàng cho production.

#### Bước 3: Cấu hình Giám sát và Cảnh báo Nâng cao

1.  **Tập trung hóa Logs**: Tận dụng tính năng tổng hợp log có sẵn của Railway. Tất cả output từ console của container sẽ được tự động thu thập và có thể tìm kiếm tại một nơi duy nhất.
2.  **Theo dõi Chỉ số (Metrics)**: Sử dụng dashboard của Railway để theo dõi các chỉ số thời gian thực như CPU, Memory và Network cho mỗi dịch vụ mà không cần cài đặt thêm.
3.  **Thiết lập Cảnh báo (Alerting)**: Tích hợp Railway với Slack hoặc một dịch vụ thông báo khác. Cấu hình các quy tắc cảnh báo cho các sự kiện quan trọng như CPU sử dụng cao, triển khai thất bại, hoặc container khởi động lại liên tục.
