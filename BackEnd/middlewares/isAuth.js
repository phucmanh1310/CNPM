import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ message: 'token not found' })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken) {
      return res.status(401).json({ message: 'token not verify' })
    }

    // Check if user exists and is active
    const user = await User.findById(decodedToken.userId)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account has been banned' })
    }

    console.log(decodedToken)
    req.userId = decodedToken.userId
    next()
  } catch {
    return res.status(500).json(`isAuth error`)
  }
}

export default isAuth
