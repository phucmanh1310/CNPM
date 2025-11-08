import Shop from '../models/shop.model.js'
import Order from '../models/order.model.js'
import mongoose from 'mongoose'
import { autoReleaseDrone } from './drone.controller.js'

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress } = req.body
    if (cartItems.length == 0 || !cartItems) {
      return res.status(400).json({ message: 'Cart is empty' })
    }
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: 'Delivery address is required' })
    }
    for (const item of cartItems) {
      if (!item.shop || !item.id) {
        return res
          .status(400)
          .json({ message: 'Invalid cart item: missing shop or id' })
      }
    }

    // Group items by shop
    const groupItemsByShop = {}
    cartItems.forEach((item) => {
      const shopId = item.shop
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = []
      }
      groupItemsByShop[shopId].push(item)
    })

    // Generate session ID for grouping orders from same checkout session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    // Create separate order for each shop
    const createdOrders = []
    for (const shopId of Object.keys(groupItemsByShop)) {
      const shop = await Shop.findById(shopId).populate('owner')
      if (!shop) {
        return res.status(400).json({ message: 'Shop not found' })
      }

      const items = groupItemsByShop[shopId]
      const subtotal = items.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.quantity),
        0
      )

      // Create order for this specific shop
      const order = await Order.create({
        user: req.userId,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'success' : 'pending', // COD is automatically successful
        deliveryAddress,
        totalAmount: subtotal,
        sessionId: sessionId, // Group orders from same checkout session
        shopOrder: [
          {
            shop: shop._id,
            owner: shop.owner._id,
            subtotal,
            shopOrderItems: items.map((i) => {
              return {
                item: i.id,
                price: i.price,
                quantity: i.quantity,
                name: i.name,
              }
            }),
          },
        ],
      })

      createdOrders.push(order)
    }

    return res.status(201).json({
      message: 'Orders placed successfully',
      orders: createdOrders,
      totalOrders: createdOrders.length,
      sessionId: sessionId,
      totalAmount: createdOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      ),
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `place order error ${error.message}` })
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('shopOrder.shop', 'name')
      .populate('shopOrder.owner', 'name email mobile')
      .populate('shopOrder.shopOrderItems.item', 'name image price')
      .populate('assignedDroneId', 'name status')

    return res.status(200).json(orders)
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get user orders error ${error.message}` })
  }
}

export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'shopOrder.owner': req.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email mobile')
      .populate('shopOrder.shop', 'name')
      .populate('shopOrder.owner', 'name email mobile')
      .populate('shopOrder.shopOrderItems.item', 'name image price')

    return res.status(200).json(orders)
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get owner orders error ${error.message}` })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopOrderId, status } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const shopOrder = order.shopOrder.id(shopOrderId)
    if (!shopOrder) {
      return res.status(404).json({ message: 'Shop order not found' })
    }

    // Kiểm tra xem owner có quyền update order này không
    if (shopOrder.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this order' })
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['accepted', 'cancelled'],
      accepted: ['preparing', 'cancelled'],
      preparing: ['prepared', 'cancelled'],
      prepared: ['handed over to drone'], // Only through drone assignment
      'handed over to drone': ['delivering'], // Auto-transition
      delivering: ['delivered'], // Only through customer confirmation
    }

    if (!validTransitions[shopOrder.status]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${shopOrder.status} to ${status}`,
      })
    }

    shopOrder.status = status

    // Auto-transition from handed over to drone to delivering
    if (status === 'handed over to drone') {
      setTimeout(async () => {
        const updatedOrder = await Order.findById(orderId)
        const updatedShopOrder = updatedOrder.shopOrder.id(shopOrderId)
        if (updatedShopOrder.status === 'handed over to drone') {
          updatedShopOrder.status = 'delivering'
          await updatedOrder.save()
        }
      }, 1000) // 1 second delay to simulate drone pickup
    }

    await order.save()

    return res
      .status(200)
      .json({ message: 'Order status updated successfully' })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `update order status error ${error.message}` })
  }
}

// Customer confirms delivery completion
export const confirmDelivery = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const shopOrder = order.shopOrder.id(shopOrderId)
    if (!shopOrder) {
      return res.status(404).json({ message: 'Shop order not found' })
    }

    // Verify that the order belongs to the current user
    if (order.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to confirm this delivery' })
    }

    // Check if order is in delivering status
    if (shopOrder.status !== 'delivering') {
      return res.status(400).json({
        message: 'Can only confirm delivery for orders that are delivering',
      })
    }

    // Update order status to delivered
    shopOrder.status = 'delivered'
    await order.save()

    // Auto-release the assigned drone
    await autoReleaseDrone(orderId)

    return res.status(200).json({
      message: 'Delivery confirmed successfully',
      order: order,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Confirm delivery error: ${error.message}` })
  }
}

// Fix stuck orders - manually transition from "handed over to drone" to "delivering"
export const fixStuckOrders = async (req, res) => {
  try {
    // Find all orders with "handed over to drone" status
    const stuckOrders = await Order.find({
      'shopOrder.status': 'handed over to drone',
    })

    let fixedCount = 0

    for (const order of stuckOrders) {
      for (const shopOrder of order.shopOrder) {
        if (shopOrder.status === 'handed over to drone') {
          shopOrder.status = 'delivering'
          fixedCount++
        }
      }
      await order.save()
    }

    return res.status(200).json({
      message: `Fixed ${fixedCount} stuck orders`,
      fixedCount: fixedCount,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Fix stuck orders error: ${error.message}` })
  }
}

export const cancelOrder = async (req, res) => {
  try {
    const { orderId, shopOrderId, cancelReason } = req.body

    if (!cancelReason || cancelReason.trim() === '') {
      return res.status(400).json({ message: 'Cancel reason is required' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const shopOrder = order.shopOrder.id(shopOrderId)
    if (!shopOrder) {
      return res.status(404).json({ message: 'Shop order not found' })
    }

    // Kiểm tra xem owner có quyền cancel order này không
    if (shopOrder.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to cancel this order' })
    }

    // Kiểm tra xem order có thể cancel không (chỉ cancel được khi status là pending)
    if (shopOrder.status !== 'pending') {
      return res.status(400).json({
        message:
          'Cannot cancel order that has been confirmed or is in progress',
      })
    }

    shopOrder.status = 'cancelled'
    shopOrder.cancelReason = cancelReason.trim()
    shopOrder.cancelledAt = new Date()

    await order.save()

    return res.status(200).json({
      message: 'Order cancelled successfully',
      cancelledOrder: shopOrder,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `cancel order error ${error.message}` })
  }
}

// Get paginated user orders with search
export const getUserOrdersPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query
    const userId = req.userId

    // Build query
    const query = { user: userId }

    // Add search filter (search in shop name or order ID)
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'shopOrder.shop': { $regex: search, $options: 'i' } },
      ]
    }

    // Add status filter
    if (status) {
      query['shopOrder.status'] = status
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('shopOrder.shop', 'name image')
        .populate('shopOrder.shopOrderItems.item', 'name image price')
        .lean(),
      Order.countDocuments(query),
    ])

    return res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        limit: parseInt(limit),
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get paginated orders error: ${error.message}` })
  }
}

// Get owner orders paginated with search
export const getOwnerOrdersPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query
    const ownerId = req.userId

    // Build query
    const query = { 'shopOrder.owner': ownerId }

    // Add search filter
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
      ]
    }

    // Add status filter
    if (status) {
      query['shopOrder.status'] = status
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'fullName email mobile')
        .populate('shopOrder.shop', 'name')
        .populate('shopOrder.shopOrderItems.item', 'name image price')
        .lean(),
      Order.countDocuments(query),
    ])

    return res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        limit: parseInt(limit),
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get owner paginated orders error: ${error.message}` })
  }
}

// Get user spending statistics (last 7 days)
export const getUserSpendingStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const stats = await Order.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'success',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Calculate total for the week
    const weekTotal = stats.reduce((sum, day) => sum + day.totalSpent, 0)
    const totalOrders = stats.reduce((sum, day) => sum + day.orderCount, 0)

    return res.status(200).json({
      dailyStats: stats,
      summary: {
        totalSpent: weekTotal,
        totalOrders: totalOrders,
        averageOrderValue: totalOrders > 0 ? weekTotal / totalOrders : 0,
        period: '7 days',
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get user stats error: ${error.message}` })
  }
}

// Get shop revenue statistics (last 7 days)
export const getShopRevenueStats = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.userId)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const stats = await Order.aggregate([
      {
        $match: {
          'shopOrder.owner': ownerId,
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'success',
        },
      },
      {
        $unwind: '$shopOrder',
      },
      {
        $match: {
          'shopOrder.owner': ownerId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalRevenue: { $sum: '$shopOrder.subtotal' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Calculate totals
    const weekTotal = stats.reduce((sum, day) => sum + day.totalRevenue, 0)
    const totalOrders = stats.reduce((sum, day) => sum + day.orderCount, 0)

    return res.status(200).json({
      dailyStats: stats,
      summary: {
        totalRevenue: weekTotal,
        totalOrders: totalOrders,
        averageOrderValue: totalOrders > 0 ? weekTotal / totalOrders : 0,
        period: '7 days',
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get shop stats error: ${error.message}` })
  }
}
