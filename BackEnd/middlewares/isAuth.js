import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ message: 'Token not found' })
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    if (!decodedToken || !decodedToken.userId) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    // Check if user exists and is active
    const user = await User.findById(decodedToken.userId)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account has been banned' })
    }

    req.userId = decodedToken.userId
    next()
  } catch (error) {
    console.error('isAuth unexpected error:', error)
    return res.status(500).json({ message: 'Authentication internal error' })
  }
}

export default isAuth
