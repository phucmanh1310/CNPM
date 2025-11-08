import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import {
  placeOrder,
  getUserOrders,
  getOwnerOrders,
  updateOrderStatus,
  cancelOrder,
  confirmDelivery,
  fixStuckOrders,
  getUserOrdersPaginated,
  getOwnerOrdersPaginated,
  getUserSpendingStats,
  getShopRevenueStats,
} from '../controllers/order.controller.js'

const orderRouter = express.Router()

orderRouter.post('/placeOrder', isAuth, placeOrder)
orderRouter.get('/getUserOrders', isAuth, getUserOrders)
orderRouter.get('/getUserOrdersPaginated', isAuth, getUserOrdersPaginated)
orderRouter.get('/getOwnerOrders', isAuth, getOwnerOrders)
orderRouter.get('/getOwnerOrdersPaginated', isAuth, getOwnerOrdersPaginated)
orderRouter.get('/stats/user', isAuth, getUserSpendingStats)
orderRouter.get('/stats/shop', isAuth, getShopRevenueStats)
orderRouter.put('/updateOrderStatus', isAuth, updateOrderStatus)
orderRouter.put('/cancelOrder', isAuth, cancelOrder)
orderRouter.put('/confirmDelivery', isAuth, confirmDelivery)
orderRouter.put('/fixStuckOrders', isAuth, fixStuckOrders)

export default orderRouter
