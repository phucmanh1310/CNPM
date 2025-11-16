# QUAN TRỌNG: Thay YOUR_APP_PASSWORD_HERE bằng App Password của Gmail

## Cách lấy Gmail App Password:

1. Truy cập: https://myaccount.google.com/apppasswords
2. Đăng nhập bằng tài khoản phucmanhtran08@gmail.com
3. Chọn "App": Mail
4. Chọn "Device": Other (Custom name) → nhập "KTPM Monitoring"
5. Click "Generate"
6. Copy mật khẩu 16 ký tự (dạng: xxxx xxxx xxxx xxxx)
7. Mở file: monitoring/alertmanager/config.yml
8. Thay YOUR_APP_PASSWORD_HERE bằng mật khẩu vừa copy (bỏ dấu cách)

Ví dụ:

```yaml
auth_password: 'abcd efgh ijkl mnop'  # SAI - có dấu cách
auth_password: 'abcdefghijklmnop'     # ĐÚNG - không có dấu cách
```

## Lưu ý bảo mật:

- File này chứa mật khẩu → KHÔNG commit lên Git
- Đã thêm vào .gitignore: monitoring/alertmanager/config.yml
- Chỉ lưu trên máy local hoặc dùng secrets trong production

## Sau khi cập nhật mật khẩu:

```powershell
# Khởi động Alertmanager
docker compose --profile monitoring up -d alertmanager

# Restart Prometheus để kết nối Alertmanager
docker compose restart prometheus

# Kiểm tra Alertmanager UI
# Mở: http://localhost:9093
```

## Test gửi email:

```powershell
# Tạo alert giả bằng cách stop backend
docker compose stop backend

# Đợi 1-2 phút → sẽ nhận email "BackendDown"

# Start lại backend
docker compose start backend

# Đợi vài phút → nhận email "RESOLVED"
```
