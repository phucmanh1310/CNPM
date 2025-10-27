import mongoose from 'mongoose'
import app from '../../index.js'

// NOTE:
// Global Jest setup (tests/setup.cjs) already spins up MongoMemoryServer
// and connects Mongoose for the whole test run. To avoid double-connections
// that cause `openUri()` errors, the helpers below are intentionally no-ops
// for setup/teardown and only clear collections between tests.

export const setupTestDB = async () => {
  // no-op: connection handled by global Jest setup
}

export const teardownTestDB = async () => {
  // no-op: global Jest teardown handles closing/stopping in-memory MongoDB
}

export const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 1) return // not connected
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
}

export { app }
