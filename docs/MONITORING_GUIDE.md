# Hướng dẫn Monitoring và Observability

## Giới thiệu

Hệ thống monitoring của KTPM E-commerce được xây dựng dựa trên stack công nghiệp chuẩn:

- **Prometheus** - Thu thập và lưu trữ metrics
- **Grafana** - Visualization và dashboard
- **Alertmanager** - Quản lý và gửi cảnh báo

## Tại sao cần Monitoring?

### 1. Phát hiện sự cố sớm

- Theo dõi hiệu suất hệ thống 24/7
- Cảnh báo tự động khi có vấn đề
- Giảm thời gian downtime

### 2. Phân tích hiệu suất

- Xác định các bottleneck
- Tối ưu hóa API endpoints
- Cải thiện trải nghiệm người dùng

### 3. Capacity Planning

- Dự đoán nhu cầu tài nguyên
- Lên kế hoạch scale hệ thống
- Quản lý chi phí hiệu quả

## Kiến trúc Monitoring

```
┌─────────────┐     metrics      ┌────────────┐
│   Backend   │ ────────────────▶ │ Prometheus │
│   :8000     │    /metrics       │   :9090    │
└─────────────┘                   └──────┬─────┘
                                         │
                                         │ query
                                         ▼
                                  ┌────────────┐
                                  │  Grafana   │
                                  │   :3000    │
                                  └────────────┘
                                         ▲
                                         │ alerts
                                         │
                                  ┌──────┴─────┐
                                  │Alertmanager│
                                  │   :9093    │
                                  └──────┬─────┘
                                         │
                                         ▼
                                     📧 Email
```

## Metrics được thu thập

### HTTP Metrics

- **Request Count** - Số lượng requests theo route và status code
- **Request Duration** - Latency của mỗi API endpoint
- **Error Rate** - Tỷ lệ lỗi 4xx/5xx

### Process Metrics

- **CPU Usage** - % CPU sử dụng bởi Node.js process
- **Memory Usage** - RSS, Heap Used, Heap Total
- **Garbage Collection** - Thời gian và tần suất GC

### Node.js Runtime Metrics

- **Event Loop Lag** - Độ trễ của event loop
- **Active Handles** - Số lượng handles đang active
- **Active Requests** - Số lượng requests đang xử lý

## Cài đặt và Sử dụng

### 1. Khởi động Monitoring Stack

```bash
# Chạy backend + monitoring stack
docker compose --profile monitoring up -d

# Kiểm tra trạng thái
docker compose ps
```

**Services sẽ chạy:**

- Backend: http://localhost:8000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Alertmanager: http://localhost:9093

### 2. Truy cập Grafana

1. Mở trình duyệt: http://localhost:3000
2. Đăng nhập:
   - Username: `admin`
   - Password: `admin`
3. Skip đổi password (hoặc đổi nếu muốn)

### 3. Thêm Prometheus Datasource

**Tự động (khuyến nghị):**

- Grafana đã được cấu hình sẵn datasource

**Thủ công (nếu cần):**

1. Menu → Connections → Data sources → Add data source
2. Chọn **Prometheus**
3. URL: `http://prometheus:9090`
4. Click **Save & Test**

### 4. Import Dashboard

**Cách 1: Sử dụng dashboard có sẵn**

Import dashboard từ Grafana.com:

1. Menu → Dashboards → New → Import
2. ID: `11159` (Node.js Application Dashboard)
3. Chọn Prometheus datasource
4. Click **Import**

**Cách 2: Tạo dashboard tùy chỉnh**

Xem hướng dẫn chi tiết tại [MONITORING_SETUP.md](./MONITORING_SETUP.md)

## Dashboard Panels Đề xuất

### 1. Overview Panel

```promql
# Total Requests
sum(ktpm_backend_http_requests_total)

# Requests per second
rate(ktpm_backend_http_requests_total[5m])
```

### 2. Latency Panel

```promql
# P95 Latency
histogram_quantile(0.95,
  rate(ktpm_backend_http_request_duration_seconds_bucket[5m])
)

# Average Response Time
rate(ktpm_backend_http_request_duration_seconds_sum[5m])
/
rate(ktpm_backend_http_request_duration_seconds_count[5m])
```

### 3. Error Rate Panel

```promql
# Error rate (5xx)
rate(ktpm_backend_http_requests_total{status_code=~"5.."}[5m])

# Error percentage
(
  sum(rate(ktpm_backend_http_requests_total{status_code=~"5.."}[5m]))
  /
  sum(rate(ktpm_backend_http_requests_total[5m]))
) * 100
```

### 4. Resource Usage Panels

```promql
# CPU Usage (%)
rate(ktpm_backend_process_cpu_user_seconds_total[5m]) * 100

# Memory Usage (MB)
ktpm_backend_process_resident_memory_bytes / 1024 / 1024

# Heap Usage (%)
(ktpm_backend_nodejs_heap_size_used_bytes
/
ktpm_backend_nodejs_heap_size_total_bytes) * 100
```

### 5. Performance Panels

```promql
# Event Loop Lag (seconds)
ktpm_backend_nodejs_eventloop_lag_seconds

# Active Handles
ktpm_backend_nodejs_active_handles
```

## Alert Rules

### 1. High Latency

**Khi:** p95 latency > 1 giây trong 5 phút  
**Hành động:** Kiểm tra slow queries, optimize endpoints

```yaml
- alert: HighLatency
  expr: histogram_quantile(0.95, rate(ktpm_backend_http_request_duration_seconds_bucket[5m])) > 1
  for: 5m
```

### 2. High Error Rate

**Khi:** Tỷ lệ lỗi 5xx > 0.1/s trong 2 phút  
**Hành động:** Kiểm tra logs, database connection

```yaml
- alert: HighErrorRate
  expr: rate(ktpm_backend_http_requests_total{status_code=~"5.."}[1m]) > 0.1
  for: 2m
```

### 3. High CPU Usage

**Khi:** CPU > 80% trong 5 phút  
**Hành động:** Kiểm tra process expensive, consider scaling

```yaml
- alert: HighCPUUsage
  expr: rate(ktpm_backend_process_cpu_user_seconds_total[5m]) * 100 > 80
  for: 5m
```

### 4. High Memory Usage

**Khi:** Heap usage > 90% trong 3 phút  
**Hành động:** Kiểm tra memory leak, restart service

```yaml
- alert: HighMemoryUsage
  expr: (ktpm_backend_nodejs_heap_size_used_bytes / ktpm_backend_nodejs_heap_size_total_bytes) * 100 > 90
  for: 3m
```

### 5. Event Loop Lag

**Khi:** Event loop lag > 0.5s trong 2 phút  
**Hành động:** Kiểm tra blocking operations

```yaml
- alert: EventLoopLag
  expr: ktpm_backend_nodejs_eventloop_lag_seconds > 0.5
  for: 2m
```

### 6. Backend Down

**Khi:** Service không phản hồi trong 1 phút  
**Hành động:** Kiểm tra container, restart service

```yaml
- alert: BackendDown
  expr: up{job="backend"} == 0
  for: 1m
```

## Cấu hình Email Alerts

### 1. Tạo Gmail App Password

1. Truy cập: https://myaccount.google.com/apppasswords
2. Đăng nhập với tài khoản Gmail
3. Chọn app: **Mail**, device: **Other (Custom name)**
4. Nhập tên: **KTPM Monitoring**
5. Click **Generate** → Copy mật khẩu 16 ký tự

### 2. Cấu hình Alertmanager

Tạo file `monitoring/alertmanager/config.yml`:

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: "smtp.gmail.com:587"
  smtp_from: "your-email@gmail.com"
  smtp_auth_username: "your-email@gmail.com"
  smtp_auth_password: "your-app-password"
  smtp_require_tls: true

route:
  receiver: "email"
  group_by: ["alertname"]
  group_wait: 10s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: "email"
    email_configs:
      - to: "your-email@gmail.com"
        headers:
          Subject: "[{{ .Status | toUpper }}:{{ .Alerts.Firing | len }}] KTPM Backend Alert"
```

### 3. Restart Alertmanager

```bash
docker compose restart alertmanager
docker compose restart prometheus
```

### 4. Test Alerts

```bash
# Stop backend để trigger alert
docker compose stop backend

# Đợi 1-2 phút, check email
```

## Giám sát trong Production

### 1. Checklist hàng ngày

- [ ] Kiểm tra Grafana dashboard
- [ ] Xem p95 latency < 500ms
- [ ] Error rate < 1%
- [ ] CPU usage < 70%
- [ ] Memory stable (không tăng liên tục)

### 2. Điều tra khi có alert

**HighLatency Alert:**

```bash
# Kiểm tra slow endpoints
curl http://localhost:9090/api/v1/query?query='topk(5, rate(ktpm_backend_http_request_duration_seconds_sum[5m]) / rate(ktpm_backend_http_request_duration_seconds_count[5m]))'

# Kiểm tra database
docker compose logs mongodb | grep slow
```

**HighErrorRate Alert:**

```bash
# Xem logs lỗi
docker compose logs backend --tail 100 | grep ERROR

# Kiểm tra MongoDB connection
docker compose exec backend curl http://localhost:8000/health
```

**HighMemoryUsage Alert:**

```bash
# Kiểm tra memory usage
docker stats ktpm-backend

# Heap snapshot (if needed)
docker compose exec backend node --expose-gc --heap-prof index.js
```

### 3. Retention và Cleanup

**Prometheus data retention:**

- Default: 15 days
- Thay đổi: thêm `--storage.tsdb.retention.time=30d` vào command

**Grafana cleanup:**

```bash
# Xóa old dashboard versions
docker compose exec grafana grafana-cli admin reset-admin-password admin
```

## Queries hữu ích

### Top 10 slowest endpoints

```promql
topk(10,
  rate(ktpm_backend_http_request_duration_seconds_sum[5m])
  /
  rate(ktpm_backend_http_request_duration_seconds_count[5m])
)
```

### Request rate by status code

```promql
sum by(status_code) (
  rate(ktpm_backend_http_requests_total[5m])
)
```

### Memory growth rate

```promql
deriv(ktpm_backend_nodejs_heap_size_used_bytes[1h])
```

### 95th percentile by route

```promql
histogram_quantile(0.95,
  sum by(route, le) (
    rate(ktpm_backend_http_request_duration_seconds_bucket[5m])
  )
)
```

## Tích hợp với CI/CD

### 1. Health check trong deployment

```yaml
# .github/workflows/deploy-render.yml
- name: Wait for deployment
  run: |
    sleep 30
    curl -f https://your-backend.onrender.com/health
    curl -f https://your-backend.onrender.com/metrics
```

### 2. Smoke tests cho metrics endpoint

```bash
# Kiểm tra metrics format
curl http://localhost:8000/metrics | grep "ktpm_backend_http_requests_total"

# Kiểm tra Prometheus có scrape được
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job=="backend") | .health'
```

## Best Practices

### 1. Naming Conventions

- Prefix metrics: `ktpm_backend_`
- Suffix units: `_seconds`, `_bytes`, `_total`
- Use snake_case

### 2. Label Cardinality

- ✅ route, status_code, method
- ❌ user_id, request_id (high cardinality)

### 3. Dashboard Organization

- **Overview** - Tổng quan hệ thống
- **HTTP** - Request metrics
- **Resources** - CPU, Memory
- **Runtime** - Node.js metrics
- **Alerts** - Active alerts

### 4. Alert Thresholds

- **Critical** - Ảnh hưởng service (p0)
- **Warning** - Cần điều tra (p1)
- **Info** - Theo dõi (p2)

## Troubleshooting

### Prometheus không scrape được backend

```bash
# Check network
docker compose exec prometheus ping backend

# Check backend /metrics
curl http://localhost:8000/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

### Grafana "No data"

```bash
# Test Prometheus datasource
curl -H "Authorization: Bearer admin:admin" \
  http://localhost:3000/api/datasources/proxy/1/api/v1/query?query=up

# Generate traffic to backend
for i in {1..100}; do curl http://localhost:8000/health; done
```

### Email alerts không gửi

```bash
# Check alertmanager logs
docker compose logs alertmanager | grep -i error

# Test SMTP connection
docker compose exec alertmanager nc -zv smtp.gmail.com 587

# Verify config
docker compose exec alertmanager amtool config routes
```

## Tài liệu liên quan

- [MONITORING_SETUP.md](./MONITORING_SETUP.md) - Hướng dẫn cài đặt chi tiết
- [ADVANCED_MONITORING.md](./ADVANCED_MONITORING.md) - Queries và alerting nâng cao
- [monitoring/alertmanager/README.md](../monitoring/alertmanager/README.md) - Cấu hình Alertmanager

## Tham khảo

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node.js Monitoring Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [prom-client GitHub](https://github.com/siimon/prom-client)
