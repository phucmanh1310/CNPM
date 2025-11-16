import jwt from 'jsonwebtoken'
import genToken from '../../../utils/token.js'

describe('utils/token.genToken', () => {
  it('should generate a valid JWT token containing userId', async () => {
    const secret = process.env.JWT_SECRET || 'test-secret-key'
    const userId = '507f191e810c19729de860ea'

    const token = await genToken(userId)
    expect(typeof token).toBe('string')

    const decoded = jwt.verify(token, secret)
    expect(decoded).toHaveProperty('userId', userId)
  })
})
