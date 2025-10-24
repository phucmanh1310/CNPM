# Monitoring và Logging Setup Guide

## 1. Application Monitoring Architecture

### 1.1 Monitoring Stack
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│    Metrics      │───▶│   Grafana       │
│   (Node.js)     │    │   (Prometheus)  │    │  (Dashboard)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Logs        │    │   Alerting      │    │   Notification  │
│ (Winston/ELK)   │    │ (AlertManager)  │    │   (Slack/Email) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Key Metrics to Monitor
- **Application Performance**
  - Response time (P50, P95, P99)
  - Throughput (requests/second)
  - Error rate (4xx, 5xx)
  - Memory usage
  - CPU utilization

- **Business Metrics**
  - User registrations
  - Order completion rate
  - Payment success rate
  - Active users

- **Infrastructure Metrics**
  - Database connections
  - Disk usage
  - Network I/O
  - Container health

## 2. Logging Configuration

### 2.1 Backend Logging (Winston)
```javascript
// BackEnd/utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ktpm-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

export default logger;
```

### 2.2 Request Logging Middleware
```javascript
// BackEnd/middlewares/requestLogger.js
import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};
```

## 3. Health Check Endpoints

### 3.1 Backend Health Check
```javascript
// BackEnd/routes/health.routes.js
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };
  
  res.status(200).json(health);
});

router.get('/health/detailed', async (req, res) => {
  const checks = {
    database: 'OK',
    memory: 'OK',
    disk: 'OK'
  };
  
  try {
    // Database check
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    checks.database = 'ERROR';
  }
  
  // Memory check
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
    checks.memory = 'WARNING';
  }
  
  const allOk = Object.values(checks).every(check => check === 'OK');
  
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'OK' : 'DEGRADED',
    checks,
    timestamp: new Date().toISOString()
  });
});

export default router;
```

## 4. Prometheus Metrics

### 4.1 Metrics Collection
```javascript
// BackEnd/utils/metrics.js
import promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);

export { register, httpRequestDuration, httpRequestTotal, activeConnections };
```

### 4.2 Metrics Middleware
```javascript
// BackEnd/middlewares/metricsMiddleware.js
import { httpRequestDuration, httpRequestTotal } from '../utils/metrics.js';

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
      
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};
```

## 5. Error Tracking với Sentry

### 5.1 Sentry Configuration
```javascript
// BackEnd/utils/sentry.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export default Sentry;
```

### 5.2 Error Handler Middleware
```javascript
// BackEnd/middlewares/errorHandler.js
import Sentry from '../utils/sentry.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  Sentry.captureException(err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};
```

## 6. Alerting Rules

### 6.1 Critical Alerts
- **Service Down**: Response rate < 50% for 2 minutes
- **High Error Rate**: Error rate > 5% for 5 minutes
- **High Response Time**: P95 response time > 2s for 5 minutes
- **Database Connection**: MongoDB connection failures

### 6.2 Warning Alerts
- **Memory Usage**: Memory usage > 80% for 10 minutes
- **CPU Usage**: CPU usage > 80% for 10 minutes
- **Disk Space**: Disk usage > 85%
- **Slow Queries**: Database queries > 1s

## 7. Dashboard Configuration

### 7.1 Grafana Dashboards
- **Application Overview**: Key metrics, error rates, response times
- **Infrastructure**: CPU, memory, disk, network
- **Business Metrics**: User activity, orders, revenue
- **Database**: Connection pool, query performance

### 7.2 Key Panels
```json
{
  "dashboard": {
    "title": "KTPM E-commerce Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100"
          }
        ]
      }
    ]
  }
}
```

## 8. Implementation Checklist

### Phase 1: Basic Monitoring
- [ ] Install Winston logging
- [ ] Add health check endpoints
- [ ] Setup basic Prometheus metrics
- [ ] Configure error tracking

### Phase 2: Advanced Monitoring
- [ ] Setup Grafana dashboards
- [ ] Configure alerting rules
- [ ] Add business metrics
- [ ] Setup log aggregation

### Phase 3: Optimization
- [ ] Performance monitoring
- [ ] Custom dashboards
- [ ] Advanced alerting
- [ ] Automated remediation
