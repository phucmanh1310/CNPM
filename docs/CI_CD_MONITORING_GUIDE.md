# CI/CD Monitoring Integration Guide

## 📊 Tổng Quan

Hệ thống monitoring đã được tích hợp để theo dõi CI/CD pipeline, bao gồm:

- ✅ Test results tracking
- ✅ Build status monitoring
- ✅ Code coverage metrics
- ✅ Performance tracking
- ✅ Automated alerts

## 🚀 Các Thành Phần

### 1. **Pushgateway**

- **Port**: 9091
- **Mục đích**: Nhận metrics từ CI/CD jobs (short-lived jobs)
- **Persistence**: Lưu metrics mỗi 5 phút

### 2. **Prometheus**

- **Port**: 9090
- **Scrapes**: Pushgateway metrics mỗi 15 giây
- **Rules**: CI/CD alert rules

### 3. **Grafana Dashboard**

- **Port**: 3000
- **Dashboard**: CI/CD Pipeline Metrics
- **Visualizations**: Test results, build status, coverage

### 4. **Alertmanager**

- **Port**: 9093
- **Alerts**: Email notifications cho CI failures

## 📝 Setup Instructions

### Bước 1: Khởi động Monitoring Stack

```powershell
# Start tất cả monitoring services (bao gồm Pushgateway)
docker-compose --profile monitoring up -d

# Verify services đang chạy
docker-compose ps
```

**Services:**

- ✅ Prometheus: http://localhost:9090
- ✅ Grafana: http://localhost:3000
- ✅ Pushgateway: http://localhost:9091
- ✅ Alertmanager: http://localhost:9093

### Bước 2: Configure GitHub Secrets

Để CI/CD có thể push metrics, cần thêm secret:

```bash
# Vào GitHub > Settings > Secrets and variables > Actions
# Thêm secret mới:

PUSHGATEWAY_URL=http://your-server-ip:9091
```

**Lưu ý:**

- Nếu chạy local, có thể expose port 9091 ra internet (ngrok, cloudflare tunnel)
- Hoặc chạy script local sau khi pull code về

### Bước 3: Test Local (Không cần CI)

```powershell
# Test script push metrics local
cd BackEnd

# Set environment variables
$env:PUSHGATEWAY_URL="http://localhost:9091"
$env:GITHUB_RUN_ID="test-123"
$env:GITHUB_WORKFLOW="Local Test"
$env:GITHUB_REF_NAME="main"
$env:TESTS_TOTAL="85"
$env:TESTS_PASSED="84"
$env:TESTS_FAILED="0"
$env:TESTS_SKIPPED="1"
$env:TEST_DURATION="12.7"
$env:BUILD_STATUS="success"
$env:COVERAGE_PERCENTAGE="85"

# Push metrics
node scripts/push-ci-metrics.js
```

### Bước 4: Verify Metrics trong Prometheus

```bash
# Mở Prometheus: http://localhost:9090
# Query examples:

ci_tests_total
ci_test_pass_rate
ci_build_status
ci_coverage_percentage
```

### Bước 5: Import Grafana Dashboard

**Option A: Manual Import**

1. Mở Grafana: http://localhost:3000
2. Login: `admin/admin`
3. Vào **Dashboards** > **Import**
4. Copy nội dung từ `monitoring/grafana/dashboards/ci-cd-dashboard.json`
5. Paste và click **Load**
6. Chọn Prometheus datasource
7. Click **Import**

**Option B: Automatic Provisioning** (Recommended)

Sửa `docker-compose.yml` để auto-load dashboard:

```yaml
grafana:
  # ... existing config
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
```

Tạo file `monitoring/grafana/datasources/prometheus.yml`:

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

Restart Grafana:

```bash
docker-compose restart grafana
```

## 📈 Metrics Available

### Test Metrics

- `ci_tests_total` - Tổng số tests
- `ci_tests_passed` - Tests passed
- `ci_tests_failed` - Tests failed
- `ci_tests_skipped` - Tests skipped
- `ci_test_pass_rate` - Pass rate (%)
- `ci_test_duration_seconds` - Test duration

### Build Metrics

- `ci_build_status` - Build status (1=success, 0=fail)
- `ci_coverage_percentage` - Code coverage
- `ci_pipeline_timestamp` - Pipeline run time

### Labels

- `workflow` - Workflow name (e.g., "CI Pipeline")
- `branch` - Branch name (e.g., "main")
- `run_id` - GitHub Actions run ID

## 🔔 Alerts Configured

### Critical Alerts

1. **CIBuildFailed** - Build thất bại
2. **ConsecutiveBuildFailures** - 3+ builds fail liên tiếp
3. **BackendDown** - Backend service down

### Warning Alerts

1. **LowTestPassRate** - Pass rate < 80%
2. **TestsFailed** - Có tests fail
3. **CoverageDropped** - Coverage < 70%

### Info Alerts

1. **SlowTestExecution** - Tests > 120s

## 🧪 Testing the Integration

### Test 1: Push Metrics Manually

```powershell
cd BackEnd
node scripts/push-ci-metrics.js
```

Verify in Pushgateway: http://localhost:9091

### Test 2: Trigger Alert

```powershell
# Push metrics với build failed
$env:BUILD_STATUS="failure"
$env:TESTS_FAILED="5"
node scripts/push-ci-metrics.js
```

Check alerts trong Prometheus: http://localhost:9090/alerts

### Test 3: View Dashboard

1. Mở Grafana: http://localhost:3000
2. Vào dashboard "CI/CD Pipeline Metrics"
3. Xem test results, build status, coverage

## 🔧 Troubleshooting

### Issue: Metrics không xuất hiện trong Prometheus

```bash
# 1. Check Pushgateway có metrics không
curl http://localhost:9091/metrics | grep ci_

# 2. Check Prometheus config
docker exec -it ktpm-prometheus cat /etc/prometheus/prometheus.yml

# 3. Check Prometheus targets
# Mở http://localhost:9090/targets
# Verify "pushgateway" target status = UP
```

### Issue: Script push metrics bị lỗi

```bash
# Check Pushgateway logs
docker logs ktpm-pushgateway

# Check network connectivity
curl -X POST http://localhost:9091/metrics/job/test/instance/test \
  --data-binary "test_metric 1"
```

### Issue: Alert không trigger

```bash
# 1. Check alert rules syntax
docker exec -it ktpm-prometheus promtool check rules /etc/prometheus/alerts.yml

# 2. Check alert status
# Mở http://localhost:9090/alerts

# 3. Check Alertmanager
# Mở http://localhost:9093
```

## 📊 Dashboard Panels Explained

1. **Test Pass Rate** - Tỷ lệ tests pass (gauge with thresholds)
2. **Build Status** - Success/Failed (stat with color coding)
3. **Code Coverage** - Coverage percentage (gauge)
4. **Test Duration** - Execution time (stat)
5. **Test Results Over Time** - Time series graph
6. **Build Success Rate (24h)** - Success rate trend
7. **Pipeline Executions** - Recent runs table

## 🎯 Best Practices

1. ✅ **Always push metrics** - Cả success và failure
2. ✅ **Include all labels** - workflow, branch, run_id
3. ✅ **Monitor alerts** - Setup email notifications
4. ✅ **Review dashboard** - Check trends regularly
5. ✅ **Set coverage thresholds** - Maintain quality standards

## 🔄 Workflow Integration

Khi push code lên GitHub:

```
1. Code Push → GitHub
2. GitHub Actions CI triggered
3. Tests run → Extract metrics
4. Push metrics → Pushgateway (port 9091)
5. Prometheus scrapes metrics (every 15s)
6. Grafana displays on dashboard
7. Alerts evaluated → Alertmanager
8. Email notifications (if thresholds exceeded)
```

## 📧 Email Notifications

Configure trong `monitoring/alertmanager/config.yml`:

```yaml
receivers:
  - name: "email"
    email_configs:
      - to: "your-email@gmail.com"
        from: "alertmanager@ktpm.com"
        # ... other configs
```

## 🚦 Next Steps

1. ✅ Setup GitHub secret `PUSHGATEWAY_URL`
2. ✅ Test metrics push locally
3. ✅ Import Grafana dashboard
4. ✅ Configure email alerts
5. ✅ Push code và verify metrics trong dashboard
6. ✅ Monitor alerts và adjust thresholds

## 📖 Additional Resources

- [Prometheus Pushgateway Docs](https://github.com/prometheus/pushgateway)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/)
- [Alerting Rules Guide](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)

---

**Created**: 2025-11-17  
**Version**: 1.0  
**Maintainer**: KTPM Team
