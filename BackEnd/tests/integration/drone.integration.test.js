import request from 'supertest'
import { jest } from '@jest/globals'
import app from '../../index.js'
import { setupTestDB, clearTestDB } from './setup.js'
import User from '../../models/user.model.js'
import Shop from '../../models/shop.model.js'
import Drone from '../../models/drone.model.js'
import Order from '../../models/order.model.js'
import { generateToken } from '../../utils/auth.js'

describe('Drone API Integration Tests', () => {
  let shopOwnerToken
  let shopOwnerId
  let shopId
  let droneId

  beforeAll(async () => {
    await setupTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()

    // Create shop owner user
    const shopOwner = await User.create({
      fullName: 'Shop Owner',
      email: 'owner@test.com',
      password: 'password123',
      mobile: '1234567890',
      role: 'owner',
    })
    shopOwnerId = shopOwner._id.toString()
    shopOwnerToken = `token=${generateToken(shopOwnerId, 'owner')}`

    // Create shop
    const shop = await Shop.create({
      name: 'Test Shop',
      owner: shopOwnerId,
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      image: 'https://example.com/shop.jpg',
    })
    shopId = shop._id.toString()
  })

  describe('GET /api/drone/getShopDrones/:shopId', () => {
    it('should initialize 5 drones when none exist', async () => {
      const response = await request(app)
        .get(`/api/drone/getShopDrones/${shopId}`)
        .set('Cookie', shopOwnerToken)
        .expect(200)

      expect(response.body).toHaveProperty(
        'message',
        'Drones initialized successfully'
      )
      expect(response.body.drones).toHaveLength(5)
      expect(response.body.drones[0]).toHaveProperty('name', 'Drone-1')
      expect(response.body.drones[0]).toHaveProperty('status', 'Available')
      expect(response.body.drones[0].shop.toString()).toBe(shopId)
    })

    it('should return existing drones when already initialized', async () => {
      // Create drones first
      await Drone.create([
        { shop: shopId, name: 'Drone-1', status: 'Available' },
        { shop: shopId, name: 'Drone-2', status: 'Busy' },
        { shop: shopId, name: 'Drone-3', status: 'Under Maintenance' },
      ])

      const response = await request(app)
        .get(`/api/drone/getShopDrones/${shopId}`)
        .set('Cookie', shopOwnerToken)
        .expect(200)

      expect(response.body.drones).toHaveLength(3)
      expect(response.body.drones[1]).toHaveProperty('status', 'Busy')
    })

    it('should return 404 for shop not owned by user', async () => {
      // Create another user's shop
      const otherOwner = await User.create({
        fullName: 'Other Owner',
        email: 'other2@test.com',
        password: 'password123',
        mobile: '8888888888',
        role: 'owner',
      })
      const otherShop = await Shop.create({
        name: 'Other Shop',
        owner: otherOwner._id,
        address: '456 Other St',
        city: 'Other City',
        state: 'Other State',
        image: 'https://example.com/other.jpg',
      })

      const response = await request(app)
        .get(`/api/drone/getShopDrones/${otherShop._id}`)
        .set('Cookie', shopOwnerToken)
        .expect(404)

      expect(response.body).toHaveProperty(
        'message',
        'Shop not found or not authorized'
      )
    })
  })

  describe('PUT /api/drone/updateStatus/:droneId', () => {
    beforeEach(async () => {
      // Create a drone
      const drone = await Drone.create({
        shop: shopId,
        name: 'Drone-1',
        status: 'Available',
      })
      droneId = drone._id.toString()
    })

    it('should update drone from Available to Under Maintenance', async () => {
      const response = await request(app)
        .put(`/api/drone/updateStatus/${droneId}`)
        .set('Cookie', shopOwnerToken)
        .send({
          status: 'Under Maintenance',
          maintenanceReason: 'Battery replacement',
        })
        .expect(200)

      expect(response.body).toHaveProperty(
        'message',
        'Drone status updated successfully'
      )
      expect(response.body.drone.status).toBe('Under Maintenance')
      expect(response.body.drone.maintenanceReason).toBe('Battery replacement')
    })

    it('should update drone from Under Maintenance to Available', async () => {
      // First set to maintenance
      await Drone.findByIdAndUpdate(droneId, {
        status: 'Under Maintenance',
        maintenanceReason: 'Testing',
      })

      const response = await request(app)
        .put(`/api/drone/updateStatus/${droneId}`)
        .set('Cookie', shopOwnerToken)
        .send({ status: 'Available' })
        .expect(200)

      expect(response.body.drone.status).toBe('Available')
      expect(response.body.drone.maintenanceReason).toBeNull()
    })

    it('should reject status change for Busy drone', async () => {
      await Drone.findByIdAndUpdate(droneId, { status: 'Busy' })

      const response = await request(app)
        .put(`/api/drone/updateStatus/${droneId}`)
        .set('Cookie', shopOwnerToken)
        .send({ status: 'Under Maintenance' })
        .expect(400)

      expect(response.body.message).toContain('Available drones')
    })

    it('should return 404 for non-existent drone', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .put(`/api/drone/updateStatus/${fakeId}`)
        .set('Cookie', shopOwnerToken)
        .send({ status: 'Available' })
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Drone not found')
    })
  })

  describe('PUT /api/drone/assignToOrder', () => {
    let orderId
    let shopOrderId

    beforeEach(async () => {
      // Create customer
      const customer = await User.create({
        fullName: 'Customer User',
        email: 'customer@test.com',
        password: 'password123',
        mobile: '5555555555',
        role: 'user',
      })

      // Create drone
      const drone = await Drone.create({
        shop: shopId,
        name: 'Drone-1',
        status: 'Available',
      })
      droneId = drone._id.toString()

      // Create order with shop order in prepared status
      const order = await Order.create({
        user: customer._id,
        totalAmount: 100,
        deliveryAddress: '789 Delivery St',
        deliveryCity: 'Test City',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        shopOrder: [
          {
            shop: shopId,
            owner: shopOwnerId,
            status: 'prepared',
            items: [],
          },
        ],
      })
      orderId = order._id.toString()
      shopOrderId = order.shopOrder[0]._id.toString()
    })

    it('should assign available drone to prepared order', async () => {
      const response = await request(app)
        .put('/api/drone/assignToOrder')
        .set('Cookie', shopOwnerToken)
        .send({
          orderId,
          shopOrderId,
          droneId,
        })
        .expect(200)

      expect(response.body).toHaveProperty(
        'message',
        'Drone assigned successfully'
      )
      expect(response.body.drone.status).toBe('Busy')
      expect(response.body.drone.assignedOrderId.toString()).toBe(orderId)
      expect(response.body.order.shopOrder[0].status).toBe(
        'handed over to drone'
      )
    })

    it('should return 404 when order not found', async () => {
      const fakeOrderId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .put('/api/drone/assignToOrder')
        .set('Cookie', shopOwnerToken)
        .send({
          orderId: fakeOrderId,
          shopOrderId,
          droneId,
        })
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Order not found')
    })

    it('should return 400 when drone is not available', async () => {
      await Drone.findByIdAndUpdate(droneId, { status: 'Busy' })

      const response = await request(app)
        .put('/api/drone/assignToOrder')
        .set('Cookie', shopOwnerToken)
        .send({
          orderId,
          shopOrderId,
          droneId,
        })
        .expect(400)

      expect(response.body.message).toContain('Drone is not available')
    })

    it('should return 400 when order is not in prepared status', async () => {
      // Update order status to something other than prepared
      await Order.findByIdAndUpdate(orderId, {
        'shopOrder.0.status': 'delivering',
      })

      const response = await request(app)
        .put('/api/drone/assignToOrder')
        .set('Cookie', shopOwnerToken)
        .send({
          orderId,
          shopOrderId,
          droneId,
        })
        .expect(400)

      expect(response.body.message).toContain(
        'Can only assign drone to prepared orders'
      )
    })
  })

  describe('PUT /api/drone/releaseDrone/:droneId', () => {
    beforeEach(async () => {
      // Create a busy drone
      const drone = await Drone.create({
        shop: shopId,
        name: 'Drone-1',
        status: 'Busy',
        assignedOrderId: '507f1f77bcf86cd799439011',
      })
      droneId = drone._id.toString()
    })

    it('should release busy drone successfully', async () => {
      const response = await request(app)
        .put(`/api/drone/releaseDrone/${droneId}`)
        .set('Cookie', shopOwnerToken)
        .expect(200)

      expect(response.body).toHaveProperty(
        'message',
        'Drone released successfully'
      )
      expect(response.body.drone.status).toBe('Available')
      expect(response.body.drone.assignedOrderId).toBeNull()
    })

    it('should return 400 when drone is already available', async () => {
      await Drone.findByIdAndUpdate(droneId, {
        status: 'Available',
        assignedOrderId: null,
      })

      const response = await request(app)
        .put(`/api/drone/releaseDrone/${droneId}`)
        .set('Cookie', shopOwnerToken)
        .expect(400)

      expect(response.body.message).toContain('Drone is not currently busy')
    })

    it('should return 404 for non-existent drone', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .put(`/api/drone/releaseDrone/${fakeId}`)
        .set('Cookie', shopOwnerToken)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Drone not found')
    })
  })

  describe('PUT /api/drone/resetAllDrones/:shopId', () => {
    beforeEach(async () => {
      // Create drones with various statuses
      await Drone.create([
        {
          shop: shopId,
          name: 'Drone-1',
          status: 'Busy',
          assignedOrderId: '507f1f77bcf86cd799439011',
        },
        {
          shop: shopId,
          name: 'Drone-2',
          status: 'Under Maintenance',
          maintenanceReason: 'Test',
        },
        { shop: shopId, name: 'Drone-3', status: 'Available' },
      ])
    })

    it('should reset all drones to Available status', async () => {
      const response = await request(app)
        .put(`/api/drone/resetAllDrones/${shopId}`)
        .set('Cookie', shopOwnerToken)
        .expect(200)

      expect(response.body).toHaveProperty(
        'message',
        'All drones reset to Available status'
      )
      expect(response.body).toHaveProperty('modifiedCount', 3)

      // Verify drones were actually reset
      const drones = await Drone.find({ shop: shopId })
      expect(drones).toHaveLength(3)
      expect(drones.every((d) => d.status === 'Available')).toBe(true)
      expect(drones.every((d) => d.assignedOrderId === null)).toBe(true)
    })

    it('should return 404 for shop not owned by user', async () => {
      const otherOwner = await User.create({
        fullName: 'Other Owner',
        email: 'other3@test.com',
        password: 'password123',
        mobile: '7777777777',
        role: 'owner',
      })
      const otherShop = await Shop.create({
        name: 'Other Shop',
        owner: otherOwner._id,
        address: '456 Other St',
        city: 'Other City',
        state: 'Other State',
        image: 'https://example.com/other.jpg',
      })

      const response = await request(app)
        .put(`/api/drone/resetAllDrones/${otherShop._id}`)
        .set('Cookie', shopOwnerToken)
        .expect(404)

      expect(response.body).toHaveProperty(
        'message',
        'Shop not found or not authorized'
      )
    })
  })
})
