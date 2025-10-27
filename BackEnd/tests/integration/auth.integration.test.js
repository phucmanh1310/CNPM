import request from 'supertest'
import { setupTestDB, teardownTestDB, clearTestDB, app } from './setup.js'
import User from '../../models/user.model.js'
import { hashPassword } from '../../utils/auth.js'

describe('Authentication API Integration', () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  afterEach(async () => {
    await clearTestDB()
  })

  describe('POST /api/auth/register', () => {
    test('should register new user and return success', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        fullName: 'New User',
        mobile: '0123456789',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('registered successfully'),
      })

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email })
      expect(user).toBeTruthy()
      expect(user.fullName).toBe(userData.fullName)
      expect(user.email).toBe(userData.email)
      expect(user.password).not.toBe(userData.password) // Should be hashed
    })

    test('should prevent duplicate email registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Existing User',
        mobile: '0123456789',
        role: 'user',
      }

      // Create user first
      await User.create({
        ...userData,
        password: await hashPassword(userData.password),
      })

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('already exists'),
      })
    })

    test('should validate required fields', async () => {
      const incompleteData = {
        email: 'incomplete@example.com',
        // Missing password, fullName, and mobile
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toMatch(
        /Password must be at least 6 characters/
      )
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        email: 'testuser@example.com',
        password: await hashPassword('correctPassword'),
        fullName: 'Test User',
        mobile: '0123456789',
        role: 'user',
      })
    })

    test('should login with correct credentials', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'correctPassword',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        user: {
          email: loginData.email,
          role: 'user',
        },
      })

      // Check that JWT cookie is set
      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies.some((cookie) => cookie.includes('token='))).toBe(true)
    })

    test('should reject incorrect password', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'wrongPassword',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid'),
      })

      // Ensure no cookie is set
      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('POST /api/auth/logout', () => {
    test('should logout and clear cookie', async () => {
      const response = await request(app).get('/api/auth/signout').expect(200)

      expect(response.body).toMatchObject({
        message: expect.stringContaining('Log out successfully'),
      })

      // Check that cookie is cleared
      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies.some((cookie) => cookie.includes('token=;'))).toBe(true)
    })
  })
})
