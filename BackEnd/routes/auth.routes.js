import express from 'express'
import {
  signUp,
  signIn,
  signOut,
  // sendOtp,
  // verifyOtp,
  // resetPassword,
} from '../controllers/auth.controllers.js'

const authRouter = express.Router()

// Original routes
authRouter.post('/signup', signUp)
authRouter.post('/signin', signIn)

// Aliases to match tests
authRouter.post('/register', signUp)
authRouter.post('/login', signIn)

authRouter.get('/signout', signOut)
authRouter.post('/logout', signOut)
export default authRouter
