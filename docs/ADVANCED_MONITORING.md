# Monitoring Nâng Cao

## Các Metrics Bổ Sung

### 1. CPU Usage

```promql
rate(ktpm_backend_process_cpu_user_seconds_total[5m]) * 100
```

Theo dõi % CPU backend đang sử dụng.

### 2. Memory Usage (MB)

```promql
ktpm_backend_process_resident_memory_bytes / 1024 / 1024
```

RAM thực tế backend đang chiếm.

### 3. Node.js Heap Usage (%)

```promql
(ktpm_backend_nodejs_heap_size_used_bytes / ktpm_backend_nodejs_heap_size_total_bytes) * 100
```

% heap memory JavaScript đang dùng. Cảnh báo nếu > 80%.

### 4. Event Loop Lag

```promql
ktpm_backend_nodejs_eventloop_lag_seconds
```

Độ trễ event loop Node.js. Nên < 0.1s.

### 5. Active Handles

```promql
ktpm_backend_nodejs_active_handles_total
```

Số lượng connections, timers, file descriptors đang mở.

### 6. Garbage Collection Time

```promql
rate(ktpm_backend_nodejs_gc_duration_seconds_sum[5m])
```

Thời gian GC, cao = memory pressure.

## Alerting Rules

File: `monitoring/prometheus/alerts.yml`

**Alerts đã cấu hình:**

- HighLatency: p95 > 1s trong 2 phút
- HighErrorRate: > 0.1 errors/sec trong 2 phút
- HighCPUUsage: CPU > 80% trong 5 phút
- HighMemoryUsage: Heap > 90% trong 5 phút
- EventLoopLag: Lag > 0.5s trong 2 phút
- BackendDown: Service không phản hồi trong 1 phút

## Xem Alerts trong Prometheus

1. Mở http://localhost:9090/alerts
2. Xem trạng thái các rules (Inactive/Pending/Firing)

## Tích Hợp Alertmanager (Tuỳ chọn)

Để gửi alert qua Slack/Email/Webhook, thêm Alertmanager vào `docker-compose.yml`:

```yaml
alertmanager:
  image: prom/alertmanager:v0.27.0
  container_name: ktpm-alertmanager
  ports:
    - "9093:9093"
  volumes:
    - ./monitoring/alertmanager/config.yml:/etc/alertmanager/config.yml:ro
  networks:
    - ktmp-network
  profiles:
    - monitoring
```

Cấu hình `monitoring/alertmanager/config.yml`:

```yaml
route:
  receiver: "slack"

receivers:
  - name: "slack"
    slack_configs:
      - api_url: "YOUR_SLACK_WEBHOOK_URL"
        channel: "#alerts"
        title: "Backend Alert"
```

## Dashboard Panels Bổ Sung

**Trong Grafana, thêm các panels:**

### CPU Usage Gauge

- Query: `rate(ktpm_backend_process_cpu_user_seconds_total[5m]) * 100`
- Visualization: Gauge
- Thresholds: 70 (vàng), 85 (đỏ)

### Memory Usage Time Series

- Query: `ktpm_backend_process_resident_memory_bytes / 1024 / 1024`
- Unit: MB

### Response Time Heatmap

- Query: `sum(increase(ktpm_backend_http_request_duration_seconds_bucket[5m])) by (le)`
- Visualization: Heatmap

## Best Practices

1. **Baseline metrics**: Chạy load test để biết metrics bình thường
2. **Alert fatigue**: Chỉ alert khi cần hành động ngay
3. **Runbook**: Ghi chú cách xử lý từng loại alert
4. **Dashboards**: Tạo dashboard cho dev (chi tiết) và ops (tổng quan)
5. **Retention**: Prometheus mặc định giữ data 15 ngày; cấu hình nếu cần lâu hơn
