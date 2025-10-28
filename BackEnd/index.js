import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './config/db.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import cors from 'cors'
import shopRouter from './routes/shop.routes.js'
import itemRouter from './routes/item.routes.js'
import orderRouter from './routes/order.routes.js'
import droneRouter from './routes/drone.routes.js'
import paymentRouter from './routes/payment.routes.js'
import adminRouter from './routes/admin.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration - allow both local and production
const allowedOrigins = [
  'http://localhost:5173',
  'https://cnpm-ten.vercel.app', // Replace with your actual Vercel URL
  process.env.FRONTEND_URL, // Add from Render env vars
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error('CORS policy: Origin not allowed'), false)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/shop', shopRouter)
app.use('/api/item', itemRouter)
app.use('/api/order', orderRouter)
app.use('/api/drone', droneRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/admin', adminRouter)

// In test environment, don't start server or connect to external DB
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`)
  })
}

export default app
