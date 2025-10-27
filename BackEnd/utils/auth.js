import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed)
}

export function generateToken(userId, role = 'user') {
  const secret = process.env.JWT_SECRET || 'test-secret-key'
  return jwt.sign({ userId, role }, secret, { expiresIn: '1h' })
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'test-secret-key'
  return jwt.verify(token, secret)
}

