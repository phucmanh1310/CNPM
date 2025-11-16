import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

let mongod

// Increase default jest timeout for slow I/O (e.g., downloading MongoDB binaries)
jest.setTimeout(60000)

// Setup before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
})

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
})

// Clean database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
})
