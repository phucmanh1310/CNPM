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

// CORS configuration - TEMPORARY: Allow all origins for testing
// TODO: Replace with specific Vercel URL after deployment
app.use(
  cors({
    origin: true, // Allow all origins temporarily
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
