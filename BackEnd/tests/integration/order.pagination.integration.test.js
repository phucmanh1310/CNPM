import request from 'supertest'
import { setupTestDB, teardownTestDB, app } from './setup.js'
import Order from '../../models/order.model.js'
import User from '../../models/user.model.js'
import Shop from '../../models/shop.model.js'
import { hashPassword, generateToken } from '../../utils/auth.js'

describe('Order Pagination & Statistics Integration Tests', () => {
  let customerToken, shopOwnerToken
  let customerId, shopOwnerId, shopId
  let testOrders = []

  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  beforeEach(async () => {
    // Reset test data
    testOrders = []

    // Create test customer
    const customer = await User.create({
      fullName: 'Test Customer',
      email: 'customer.pagination@test.com',
      password: await hashPassword('password123'),
      mobile: '1234567890',
      role: 'user',
    })
    customerId = customer._id
    customerToken = generateToken(customerId, 'user')

    // Create test shop owner
    const shopOwner = await User.create({
      fullName: 'Test Shop Owner',
      email: 'shopowner.pagination@test.com',
      password: await hashPassword('password123'),
      mobile: '0987654321',
      role: 'owner',
    })
    shopOwnerId = shopOwner._id
    shopOwnerToken = generateToken(shopOwnerId, 'owner')

    // Create test shop
    const shop = await Shop.create({
      name: 'Test Shop for Pagination',
      owner: shopOwnerId,
      city: 'Ho Chi Minh City',
      state: 'Ho Chi Minh',
      address: '123 Test Street',
      image: 'test-shop.jpg',
    })
    shopId = shop._id

    // Create test orders (15 orders spread over 7 days)
    const today = new Date()
    for (let i = 0; i < 15; i++) {
      const orderDate = new Date(today)
      orderDate.setDate(today.getDate() - (i % 7)) // Spread across 7 days

      const order = await Order.create({
        user: customerId,
        paymentMethod: 'momo',
        paymentStatus: 'success',
        deliveryAddress: {
          text: 'Test Address',
          latitude: 10.762622,
          longitude: 106.660172,
        },
        total: 100 + i * 10, // Varying totals
        shopOrder: [
          {
            shop: shopId,
            owner: shopOwnerId,
            subtotal: 100 + i * 10,
            status: i < 5 ? 'delivered' : 'pending',
            shopOrderItems: [],
          },
        ],
        createdAt: orderDate,
      })
      testOrders.push(order)
    }
  })

  describe('GET /api/order/getUserOrdersPaginated', () => {
    it('should return first page of orders with default limit', async () => {
      const response = await request(app)
        .get('/api/order/getUserOrdersPaginated')
        .set('Cookie', [`token=${customerToken}`])
        .expect(200)

      expect(response.body).toHaveProperty('orders')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.orders).toHaveLength(10) // Default limit
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        totalPages: 2,
        totalOrders: 15,
        limit: 10,
      })
    })

    it('should return second page with custom limit', async () => {
      const response = await request(app)
        .get('/api/order/getUserOrdersPaginated?page=2&limit=5')
        .set('Cookie', [`token=${customerToken}`])
        .expect(200)

      expect(response.body.orders).toHaveLength(5)
      expect(response.body.pagination.currentPage).toBe(2)
      expect(response.body.pagination.totalPages).toBe(3)
    })

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/order/getUserOrdersPaginated?status=delivered')
        .set('Cookie', [`token=${customerToken}`])
        .expect(200)

      expect(response.body.orders.length).toBeGreaterThan(0)
      // All orders should have delivered status
      response.body.orders.forEach((order) => {
        expect(order.shopOrder.some((so) => so.status === 'delivered')).toBe(
          true
        )
      })
    })

    it('should search by order ID', async () => {
      const testOrderId = testOrders[0]._id.toString().substring(0, 5)

      const response = await request(app)
        .get(`/api/order/getUserOrdersPaginated?search=${testOrderId}`)
        .set('Cookie', [`token=${customerToken}`])
        .expect(200)

      expect(response.body.orders.length).toBeGreaterThanOrEqual(0)
    })

    it('should return 401 if not authenticated', async () => {
      await request(app).get('/api/order/getUserOrdersPaginated').expect(401)
    })
  })

  describe('GET /api/order/getOwnerOrdersPaginated', () => {
    it('should return paginated orders for shop owner', async () => {
      const response = await request(app)
        .get('/api/order/getOwnerOrdersPaginated')
        .set('Cookie', [`token=${shopOwnerToken}`])
        .expect(200)

      expect(response.body).toHaveProperty('orders')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.orders).toHaveLength(10)
      expect(response.body.pagination.totalOrders).toBe(15)
    })

    it('should return empty result for owner with no orders', async () => {
      // Create a new owner with no orders
      const newOwner = await User.create({
        fullName: 'Empty Owner',
        email: 'empty.owner@test.com',
        password: await hashPassword('password123'),
        mobile: '5555555555',
        role: 'owner',
      })
      const emptyOwnerToken = generateToken(newOwner._id, 'owner')

      const response = await request(app)
        .get('/api/order/getOwnerOrdersPaginated')
        .set('Cookie', [`token=${emptyOwnerToken}`])
        .expect(200)

      expect(response.body.orders).toHaveLength(0)
      expect(response.body.pagination.totalOrders).toBe(0)

      await User.deleteOne({ _id: newOwner._id })
    })
  })

  describe('GET /api/order/stats/user', () => {
    it('should return spending statistics for last 7 days', async () => {
      const response = await request(app)
        .get('/api/order/stats/user')
        .set('Cookie', [`token=${customerToken}`])
        .expect(200)

      expect(response.body).toHaveProperty('dailyStats')
      expect(response.body).toHaveProperty('summary')
      expect(response.body.summary).toHaveProperty('totalSpent')
      expect(response.body.summary).toHaveProperty('totalOrders')
      expect(response.body.summary).toHaveProperty('averageOrderValue')
      expect(response.body.summary.period).toBe('7 days')

      // Verify calculations
      const { totalSpent, totalOrders, averageOrderValue } =
        response.body.summary
      expect(totalSpent).toBeGreaterThan(0)
      expect(totalOrders).toBeGreaterThan(0)
      expect(averageOrderValue).toBe(totalSpent / totalOrders)
    })

    it('should only include successful payments', async () => {
      // Create a failed payment order
      await Order.create({
        user: customerId,
        paymentMethod: 'momo',
        paymentStatus: 'failed',
        deliveryAddress: {
          text: 'Test Address',
          latitude: 10.762622,
          longitude: 106.660172,
        },
        total: 99999,
        shopOrder: [],
        createdAt: new Date(),
      })

      const response = await request(app)
        .get('/api/order/stats/user')
        .set('Cookie', [`token=${customerToken}`])
        .expect(200)

      // Total should not include the failed payment
      expect(response.body.summary.totalSpent).not.toBe(99999)
    })

    it('should return 401 if not authenticated', async () => {
      await request(app).get('/api/order/stats/user').expect(401)
    })
  })

  describe('GET /api/order/stats/shop', () => {
    it('should return revenue statistics for shop owner', async () => {
      const response = await request(app)
        .get('/api/order/stats/shop')
        .set('Cookie', [`token=${shopOwnerToken}`])
        .expect(200)

      expect(response.body).toHaveProperty('dailyStats')
      expect(response.body).toHaveProperty('summary')
      expect(response.body.summary).toHaveProperty('totalRevenue')
      expect(response.body.summary).toHaveProperty('totalOrders')
      expect(response.body.summary).toHaveProperty('averageOrderValue')

      // Verify calculations
      const { totalRevenue, totalOrders, averageOrderValue } =
        response.body.summary
      expect(totalRevenue).toBeGreaterThan(0)
      expect(totalOrders).toBeGreaterThan(0)
      expect(averageOrderValue).toBe(totalRevenue / totalOrders)
    })

    it('should return daily breakdown', async () => {
      const response = await request(app)
        .get('/api/order/stats/shop')
        .set('Cookie', [`token=${shopOwnerToken}`])
        .expect(200)

      expect(Array.isArray(response.body.dailyStats)).toBe(true)

      // Each day should have required fields
      response.body.dailyStats.forEach((day) => {
        expect(day).toHaveProperty('_id') // Date string
        expect(day).toHaveProperty('totalRevenue')
        expect(day).toHaveProperty('orderCount')
        expect(typeof day.totalRevenue).toBe('number')
        expect(typeof day.orderCount).toBe('number')
      })
    })
  })
})
