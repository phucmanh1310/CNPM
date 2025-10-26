import request from 'supertest'
import app from '../../index.js'
import User from '../../models/user.model.js'
import { hashPassword } from '../../utils/auth.js'

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    test('should register user with valid data', async () => {
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

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('registered successfully')

      const user = await User.findOne({ email: userData.email })
      expect(user).toBeDefined()
      expect(user.name).toBe(userData.name)
    })

    test('should reject duplicate email registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      }

      // Create user first
      await User.create({
        email: userData.email,
        password: await hashPassword(userData.password),
        fullName: 'Existing User',
        mobile: '0123456789',
        role: 'user',
      })

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('already exists')
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

      expect(response.body.success).toBe(true)
      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe(loginData.email)
      expect(response.headers['set-cookie']).toBeDefined()
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

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid')
    })

    test('should reject non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'anyPassword',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })
})
