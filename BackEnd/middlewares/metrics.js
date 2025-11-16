import client from 'prom-client'

// Create a Registry to register the metrics
const register = new client.Registry()

// Collect default metrics (process, heap, event loop, etc.)
client.collectDefaultMetrics({ register, prefix: 'ktpm_backend_' })

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'ktpm_backend_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
})
register.registerMetric(httpRequestDuration)

// HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'ktpm_backend_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})
register.registerMetric(httpRequestCounter)

// HTTP error counter
const httpErrorCounter = new client.Counter({
  name: 'ktpm_backend_http_errors_total',
  help: 'Total number of HTTP 5xx errors',
  labelNames: ['method', 'route', 'status_code'],
})
register.registerMetric(httpErrorCounter)

// Express middleware to measure each request
export const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint()

  res.on('finish', () => {
    const end = process.hrtime.bigint()
    const diffSeconds = Number(end - start) / 1e9

    // route may be undefined (e.g., 404); fallback to req.path
    const route = (req.route && req.route.path) || req.path || 'unknown'
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    }

    httpRequestDuration.observe(labels, diffSeconds)
    httpRequestCounter.inc(labels)
    if (res.statusCode >= 500) {
      httpErrorCounter.inc(labels)
    }
  })

  next()
}

// Endpoint handler to expose metrics
export const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    const metrics = await register.metrics()
    res.status(200).send(metrics)
  } catch (err) {
    res.status(500).send(err.message || 'metrics error')
  }
}

export default register
