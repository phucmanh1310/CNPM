import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from '../../utils/auth.js'

describe('Authentication Utils', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
      expect(hashedPassword.startsWith('$2b$')).toBe(true)
    })

    test('should compare passwords correctly', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)

      const isMatch = await comparePassword(password, hashedPassword)
      const isNotMatch = await comparePassword('wrongPassword', hashedPassword)

      expect(isMatch).toBe(true)
      expect(isNotMatch).toBe(false)
    })
  })

  describe('JWT Token Management', () => {
    test('should generate valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011'
      const role = 'user'
      const token = generateToken(userId, role)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      expect(decoded.userId).toBe(userId)
      expect(decoded.role).toBe(role)
      expect(decoded.exp).toBeDefined()
    })

    test('should verify valid token', () => {
      const userId = 'testUserId'
      const token = generateToken(userId, 'user')
      const decoded = verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(userId)
    })

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here'

      expect(() => verifyToken(invalidToken)).toThrow()
    })
  })
})
