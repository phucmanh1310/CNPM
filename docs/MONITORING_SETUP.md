# Thiết lập Monitoring (Prometheus + Grafana + Metrics)

Tài liệu này hướng dẫn chạy monitoring cơ bản ở môi trường local và staging.

## Metrics Backend

- Endpoint: `GET /metrics` (định dạng Prometheus)
- Bao gồm:
  - Metrics mặc định của tiến trình Node.js (tiền tố `ktpm_backend_`)
  - Biểu đồ độ trễ HTTP: `ktpm_backend_http_request_duration_seconds{method,route,status_code}`
  - Bộ đếm số lượng request: `ktpm_backend_http_requests_total{method,route,status_code}`
  - Bộ đếm lỗi HTTP 5xx: `ktpm_backend_http_errors_total{method,route,status_code}`

## Monitoring cục bộ (Local)

- Prometheus scrape từ `backend:8000/metrics`
- Giao diện Grafana tại `http://localhost:3000` (admin/admin)

### Khởi động dịch vụ (Windows PowerShell)

Trước khi chạy docker compose, hãy tạo file `.env` tại thư mục gốc dự án:

```powershell
cd "D:/hoctap/Năm 4/HK1/KTPM_ThayTai/Project/KTPM"
Copy-Item .env.example .env -Force
# (Khuyến nghị) Mở .env và cập nhật biến MONGODB_URL như sau để chạy trong Docker:
# MONGODB_URL=mongodb://admin:password@mongodb:27017/ktpm_ecommerce?authSource=admin
```

```powershell
# Chạy ứng dụng kèm profile monitoring
docker compose --profile monitoring up -d
# Nếu app đã chạy, có thể chỉ khởi động stack monitoring
docker compose --profile monitoring up -d prometheus grafana
```

### Prometheus

- URL: `http://localhost:9090`
- Cấu hình: `monitoring/prometheus/prometheus.yml`

### Grafana

- URL: `http://localhost:3000`
- Đăng nhập: `admin` / `admin`
- Thêm Prometheus làm data source:
  - URL: `http://prometheus:9090`
- Gợi ý dashboard:
  - Tạo dashboard với các panel:
    - p50/p95 HTTP latency: `histogram_quantile(0.95, sum(rate(ktpm_backend_http_request_duration_seconds_bucket[5m])) by (le, route))`
  - Tốc độ request: `sum(rate(ktpm_backend_http_requests_total[5m])) by (route)`
  - Tỷ lệ lỗi: `sum(rate(ktpm_backend_http_errors_total[5m])) by (route)`

## Hướng dẫn cho Staging

- Mở `GET /metrics` trên backend staging.
- Triển khai Prometheus + Grafana tại staging (ví dụ dùng Helm `kube-prometheus-stack`) hoặc dịch vụ managed.
- Thêm alert với Alertmanager (ví dụ):
  - Tỷ lệ lỗi cao
  - p95 latency vượt ngưỡng

## Logging tập trung (Bước tiếp theo)

- Phương án A: Grafana Loki + Promtail (docker compose, thu gom log từ container)
- Phương án B: ELK Stack (Elasticsearch + Logstash + Kibana)
- Cập nhật `BackEnd/utils/logger.js` để log JSON và đẩy về backend logging đã chọn.

## Tracing (Bước tiếp theo)

- Thêm OpenTelemetry SDK cho Node.js với auto-instrumentation (HTTP, Express, Mongoose) và OTLP exporter.
- Xuất trace sang Grafana Tempo/Jaeger/Datadog.

## Tích hợp CI

- Sau khi deploy staging, thêm smoke test xác nhận `/metrics` trả 200 và nội dung không rỗng.
- Tuỳ chọn: xuất một số metrics chính vào GitHub Job Summary để quan sát nhanh.

# Monitoring Setup (Prometheus + Grafana + Metrics)

This document describes how to run basic monitoring locally and in staging.

## Backend Metrics

- Endpoint: `GET /metrics` (Prometheus format)
- Includes:
  - Default Node.js process metrics (prefixed `ktpm_backend_`)
  - HTTP request duration histogram: `ktpm_backend_http_request_duration_seconds{method,route,status_code}`
  - HTTP requests counter: `ktpm_backend_http_requests_total{method,route,status_code}`
  - HTTP errors counter: `ktpm_backend_http_errors_total{method,route,status_code}`

## Local Monitoring Stack

- Prometheus scrapes `backend:8000/metrics`
- Grafana UI at `http://localhost:3000` (admin/admin)

### Start services (Windows PowerShell)

```powershell
# Start app + monitoring profile
docker compose --profile monitoring up -d
# Or if app already running, you can start only monitoring
docker compose --profile monitoring up -d prometheus grafana
```

### Prometheus

- URL: `http://localhost:9090`
- Config: `monitoring/prometheus/prometheus.yml`

### Grafana

- URL: `http://localhost:3000`
- Login: `admin` / `admin`
- Add Prometheus data source:
  - URL: `http://prometheus:9090`
- Suggested dashboards:
  - Create dashboard with panels:
    - p50/p95 HTTP latency: `histogram_quantile(0.95, sum(rate(ktpm_backend_http_request_duration_seconds_bucket[5m])) by (le, route))`
    - Request rate: `sum(rate(ktpm_backend_http_requests_total[5m])) by (route)`
    - Error rate: `sum(rate(ktpm_backend_http_errors_total[5m])) by (route)`

## Staging Guidance

- Expose `/metrics` in staging backend.
- Deploy Prometheus+Grafana in staging cluster (e.g., Helm kube-prometheus-stack) or use a managed service.
- Add alerting via Alertmanager (examples):
  - High error rate
  - Latency p95 above threshold

## Centralized Logging (Next Steps)

- Option A: Grafana Loki + Promtail (docker compose, scrape docker logs)
- Option B: ELK stack (Elasticsearch + Logstash + Kibana)
- Update `BackEnd/utils/logger.js` to ensure JSON logs; ship logs to chosen backend.

## Tracing (Next Steps)

- Add OpenTelemetry SDK for Node.js with auto-instrumentation (HTTP, Express, Mongoose) and OTLP exporter.
- Export traces to Grafana Tempo/Jaeger/Datadog.

## CI Integration

- After staging deploy, add smoke checks to confirm `/metrics` returns 200 and non-empty body.
- Optionally publish key metrics as GitHub Job Summary for quick visibility.
