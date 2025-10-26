import User from '../../models/user.model.js'

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        fullName: 'Test User',
        mobile: '0123456789',
        role: 'user',
      }

      const user = await User.create(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
      expect(user.role).toBe('user')
      expect(user._id).toBeDefined()
      expect(user.createdAt).toBeDefined()
    })

    test('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        fullName: 'User One',
        mobile: '0123456789',
        role: 'user',
      }

      await User.create(userData)

      await expect(User.create(userData)).rejects.toThrow(/duplicate key error/)
    })

    test('should require email field', async () => {
      const userData = {
        password: 'password123',
        name: 'No Email User',
      }

      await expect(User.create(userData)).rejects.toThrow(/email.*required/)
    })
  })

  describe('User Queries', () => {
    test('should find user by email', async () => {
      const email = 'findme@example.com'
      await User.create({
        email,
        password: 'password123',
        fullName: 'Find Me',
        mobile: '0123456789',
        role: 'user',
      })

      const user = await User.findOne({ email })

      expect(user).toBeDefined()
      expect(user.email).toBe(email)
    })

    test('should return null for non-existent user', async () => {
      const user = await User.findOne({ email: 'nonexistent@example.com' })

      expect(user).toBeNull()
    })
  })
})
