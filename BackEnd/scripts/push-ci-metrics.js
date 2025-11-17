#!/usr/bin/env node

/**
 * Push CI/CD Metrics to Prometheus Pushgateway
 *
 * This script pushes test results and build metrics from CI/CD pipeline
 * to Prometheus Pushgateway for monitoring and visualization.
 *
 * Usage:
 *   node push-ci-metrics.js
 *
 * Environment Variables:
 *   PUSHGATEWAY_URL - Pushgateway URL (default: http://localhost:9091)
 *   GITHUB_RUN_ID - GitHub Actions run ID
 *   GITHUB_WORKFLOW - Workflow name
 *   GITHUB_REF_NAME - Branch name
 *   TESTS_TOTAL - Total number of tests
 *   TESTS_PASSED - Number of passed tests
 *   TESTS_FAILED - Number of failed tests
 *   TESTS_SKIPPED - Number of skipped tests
 *   TEST_DURATION - Test execution duration in seconds
 *   BUILD_STATUS - Build status (success/failure)
 *   COVERAGE_PERCENTAGE - Code coverage percentage
 */

import https from 'https'
import http from 'http'

const PUSHGATEWAY_URL = process.env.PUSHGATEWAY_URL || 'http://localhost:9091'
const RUN_ID = process.env.GITHUB_RUN_ID || 'local'
const WORKFLOW = process.env.GITHUB_WORKFLOW || 'local'
const BRANCH = process.env.GITHUB_REF_NAME || 'unknown'

// Parse metrics from environment
const metrics = {
  tests_total: parseInt(process.env.TESTS_TOTAL || '0', 10),
  tests_passed: parseInt(process.env.TESTS_PASSED || '0', 10),
  tests_failed: parseInt(process.env.TESTS_FAILED || '0', 10),
  tests_skipped: parseInt(process.env.TESTS_SKIPPED || '0', 10),
  test_duration_seconds: parseFloat(process.env.TEST_DURATION || '0'),
  build_status: process.env.BUILD_STATUS === 'success' ? 1 : 0,
  coverage_percentage: parseFloat(process.env.COVERAGE_PERCENTAGE || '0'),
}

// Calculate additional metrics
const passRate =
  metrics.tests_total > 0
    ? ((metrics.tests_passed / metrics.tests_total) * 100).toFixed(2)
    : 0

console.log('📊 CI/CD Metrics Summary:')
console.log('========================')
console.log(`Workflow: ${WORKFLOW}`)
console.log(`Branch: ${BRANCH}`)
console.log(`Run ID: ${RUN_ID}`)
console.log(`Tests Total: ${metrics.tests_total}`)
console.log(`Tests Passed: ${metrics.tests_passed}`)
console.log(`Tests Failed: ${metrics.tests_failed}`)
console.log(`Tests Skipped: ${metrics.tests_skipped}`)
console.log(`Pass Rate: ${passRate}%`)
console.log(`Duration: ${metrics.test_duration_seconds}s`)
console.log(
  `Build Status: ${metrics.build_status ? '✅ Success' : '❌ Failed'}`
)
console.log(`Coverage: ${metrics.coverage_percentage}%`)
console.log('========================\n')

/**
 * Format metrics in Prometheus text format
 */
function formatMetrics() {
  const labels = `workflow="${WORKFLOW}",branch="${BRANCH}",run_id="${RUN_ID}"`

  return `# TYPE ci_tests_total gauge
# HELP ci_tests_total Total number of tests executed in CI
ci_tests_total{${labels}} ${metrics.tests_total}

# TYPE ci_tests_passed gauge
# HELP ci_tests_passed Number of tests that passed
ci_tests_passed{${labels}} ${metrics.tests_passed}

# TYPE ci_tests_failed gauge
# HELP ci_tests_failed Number of tests that failed
ci_tests_failed{${labels}} ${metrics.tests_failed}

# TYPE ci_tests_skipped gauge
# HELP ci_tests_skipped Number of tests that were skipped
ci_tests_skipped{${labels}} ${metrics.tests_skipped}

# TYPE ci_test_duration_seconds gauge
# HELP ci_test_duration_seconds Duration of test execution in seconds
ci_test_duration_seconds{${labels}} ${metrics.test_duration_seconds}

# TYPE ci_build_status gauge
# HELP ci_build_status Build status (1 = success, 0 = failure)
ci_build_status{${labels}} ${metrics.build_status}

# TYPE ci_coverage_percentage gauge
# HELP ci_coverage_percentage Code coverage percentage
ci_coverage_percentage{${labels}} ${metrics.coverage_percentage}

# TYPE ci_test_pass_rate gauge
# HELP ci_test_pass_rate Test pass rate percentage
ci_test_pass_rate{${labels}} ${passRate}

# TYPE ci_pipeline_timestamp gauge
# HELP ci_pipeline_timestamp Unix timestamp of the pipeline run
ci_pipeline_timestamp{${labels}} ${Math.floor(Date.now() / 1000)}
`
}

/**
 * Push metrics to Pushgateway
 */
function pushMetrics() {
  const url = new URL(PUSHGATEWAY_URL)
  const metricsData = formatMetrics()
  const path = `/metrics/job/ci_pipeline/instance/${RUN_ID}`

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(metricsData),
    },
  }

  const client = url.protocol === 'https:' ? https : http

  console.log(`📤 Pushing metrics to: ${url.href}${path}`)

  const req = client.request(options, (res) => {
    let data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log('✅ Metrics pushed successfully!')
        console.log(`Response: ${res.statusCode} - ${data || 'OK'}`)
      } else {
        console.error(`❌ Failed to push metrics: ${res.statusCode}`)
        console.error(`Response: ${data}`)
        process.exit(1)
      }
    })
  })

  req.on('error', (error) => {
    console.error('❌ Error pushing metrics:', error.message)
    console.error('Make sure Pushgateway is running and accessible.')
    process.exit(1)
  })

  req.write(metricsData)
  req.end()
}

// Execute
try {
  pushMetrics()
} catch (error) {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
}
