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

// Trust the first proxy in front of the app (e.g., Render's reverse proxy)
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000

// CORS configuration - TEMPORARY: Allow all origins for testing
// TODO: Replace with specific Vercel URL after deployment
const allowedOrigins = [
  'http://localhost:5173',
  // Add the main production URL from your .env file if you have one
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
]

// Regex to match Vercel's preview deployment URLs for your project
const vercelPreviewRegex = /^https:\/\/cnpm-.*\.vercel\.app$/

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      // Check if the origin is in the allowed list or matches the Vercel regex
      if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
        return callback(null, true)
      } else {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
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

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    message: 'KTMP E-commerce API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/user',
      shops: '/api/shop',
      items: '/api/item',
      orders: '/api/order',
      drones: '/api/drone',
      payment: '/api/payment',
      admin: '/api/admin',
    },
    docs: 'Visit /health for health status',
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
