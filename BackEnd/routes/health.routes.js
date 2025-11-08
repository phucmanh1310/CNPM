import express from 'express'
import mongoose from 'mongoose'
import logger from '../utils/logger.js'

const router = express.Router()

// Basic health check
router.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
  }

  logger.info('Health check requested', { health })
  res.status(200).json(health)
})

// Detailed health check with dependencies
router.get('/health/detailed', async (req, res) => {
  const startTime = Date.now()
  const checks = {
    database: { status: 'OK', responseTime: 0 },
    memory: { status: 'OK', usage: 0 },
    disk: { status: 'OK', usage: 0 },
  }

  let overallStatus = 'OK'

  try {
    // Database connectivity check
    const dbStart = Date.now()
    await mongoose.connection.db.admin().ping()
    checks.database.responseTime = Date.now() - dbStart

    if (checks.database.responseTime > 1000) {
      checks.database.status = 'WARNING'
      overallStatus = 'DEGRADED'
    }
  } catch (error) {
    checks.database.status = 'ERROR'
    checks.database.error = error.message
    overallStatus = 'UNHEALTHY'
    logger.error('Database health check failed', { error: error.message })
  }

  // Memory usage check
  const memUsage = process.memoryUsage()
  const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
  checks.memory.usage = Math.round(memoryUsagePercent)

  if (memoryUsagePercent > 90) {
    checks.memory.status = 'ERROR'
    overallStatus = 'UNHEALTHY'
  } else if (memoryUsagePercent > 80) {
    checks.memory.status = 'WARNING'
    if (overallStatus === 'OK') overallStatus = 'DEGRADED'
  }

  // Disk usage check (simplified)
  try {
    const fs = await import('fs')
    fs.statSync('.')
    // This is a simplified check - in production, you'd want to check actual disk usage
    checks.disk.status = 'OK'
  } catch (error) {
    checks.disk.status = 'WARNING'
    checks.disk.error = error.message
  }

  const responseTime = Date.now() - startTime
  const healthResponse = {
    status: overallStatus,
    checks,
    responseTime,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  }

  const statusCode =
    overallStatus === 'OK' ? 200 : overallStatus === 'DEGRADED' ? 200 : 503

  logger.info('Detailed health check completed', {
    status: overallStatus,
    responseTime,
    checks,
  })

  res.status(statusCode).json(healthResponse)
})

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if the application is ready to serve traffic
    await mongoose.connection.db.admin().ping()
    res.status(200).json({ status: 'ready' })
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message })
    res.status(503).json({ status: 'not ready', error: error.message })
  }
})

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  // Simple liveness check - if the process is running, it's alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

export default router
