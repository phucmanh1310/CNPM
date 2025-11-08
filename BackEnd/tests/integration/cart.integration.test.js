import request from 'supertest'
import { setupTestDB, teardownTestDB, clearTestDB, app } from './setup.js'
import User from '../../models/user.model.js'
import Shop from '../../models/shop.model.js'
import Item from '../../models/item.model.js'
import Cart from '../../models/cart.model.js'
import { hashPassword, generateToken } from '../../utils/auth.js'

describe('Cart API Integration', () => {
  let userToken
  let userId
  let shopId
  let itemId

  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()

    // Create a test user
    const user = await User.create({
      email: 'testuser@example.com',
      password: await hashPassword('password123'),
      fullName: 'Test User',
      mobile: '0123456789',
      role: 'user',
    })
    userId = user._id
    userToken = generateToken(userId)

    // Create a shop owner
    const shopOwner = await User.create({
      email: 'shopowner@example.com',
      password: await hashPassword('password123'),
      fullName: 'Shop Owner',
      mobile: '0987654321',
      role: 'owner',
    })

    // Create a shop
    const shop = await Shop.create({
      name: 'Test Shop',
      owner: shopOwner._id,
      city: 'Test City',
      state: 'Test State',
      address: '123 Test Street',
      pincode: '123456',
    })
    shopId = shop._id

    // Create an item
    const item = await Item.create({
      name: 'Test Item',
      shop: shopId,
      price: 100,
      image: 'test-image.jpg',
      category: 'Snack',
      foodType: 'veg',
      description: 'Test item description',
    })
    itemId = item._id
  })

  describe('GET /api/cart', () => {
    test('should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Cookie', [`token=${userToken}`])
        .expect(200)

      expect(response.body.items).toBeDefined()
      expect(response.body.items).toEqual([])
    })

    test('should return user cart with items', async () => {
      // Create cart with item
      await Cart.create({
        user: userId,
        items: [
          {
            item: itemId,
            shop: shopId,
            name: 'Test Item',
            price: 100,
            quantity: 2,
          },
        ],
      })

      const response = await request(app)
        .get('/api/cart')
        .set('Cookie', [`token=${userToken}`])
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].quantity).toBe(2)
    })

    test('should require authentication', async () => {
      await request(app).get('/api/cart').expect(401)
    })
  })

  describe('POST /api/cart/add', () => {
    test('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Cookie', [`token=${userToken}`])
        .send({
          itemId: itemId.toString(),
          quantity: 1,
        })
        .expect(200)

      expect(response.body.message).toContain('added to cart')

      // Verify cart in database
      const cart = await Cart.findOne({ user: userId })
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0].quantity).toBe(1)
    })

    test('should return 400 if itemId is missing', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Cookie', [`token=${userToken}`])
        .send({
          quantity: 1,
        })
        .expect(400)

      expect(response.body.message).toContain('Item ID is required')
    })

    test('should return 404 if item does not exist', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Cookie', [`token=${userToken}`])
        .send({
          itemId: '507f1f77bcf86cd799439011', // Non-existent ID
          quantity: 1,
        })
        .expect(404)

      expect(response.body.message).toContain('Item not found')
    })

    test('should require authentication', async () => {
      await request(app)
        .post('/api/cart/add')
        .send({
          itemId: itemId.toString(),
          quantity: 1,
        })
        .expect(401)
    })
  })

  describe('DELETE /api/cart/clear', () => {
    test('should clear all items from cart', async () => {
      // Create cart with items
      await Cart.create({
        user: userId,
        items: [
          {
            item: itemId,
            shop: shopId,
            name: 'Test Item',
            price: 100,
            quantity: 2,
          },
        ],
      })

      const response = await request(app)
        .delete('/api/cart/clear')
        .set('Cookie', [`token=${userToken}`])
        .expect(200)

      expect(response.body.message).toContain('cleared')

      // Verify cart is empty
      const cart = await Cart.findOne({ user: userId })
      expect(cart.items).toHaveLength(0)
    })

    test('should require authentication', async () => {
      await request(app).delete('/api/cart/clear').expect(401)
    })
  })
})
