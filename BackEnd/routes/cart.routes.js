import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller.js'

const router = express.Router()

// All cart routes require authentication
router.use(isAuth)

// Get user's cart
router.get('/', getCart)

// Add item to cart
router.post('/add', addToCart)

// Update cart item quantity
router.put('/update/:itemId', updateCartItem)

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart)

// Clear entire cart
router.delete('/clear', clearCart)

export default router
