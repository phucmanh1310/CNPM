import request from 'supertest'
import { setupTestDB, teardownTestDB, clearTestDB, app } from './setup.js'
import User from '../../models/user.model.js'
import Shop from '../../models/shop.model.js'
import { hashPassword, generateToken } from '../../utils/auth.js'

describe('Shop API Integration', () => {
  let userToken
  let shopOwnerToken
  let adminToken
  let testUser
  let shopOwner
  let testShop

  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()

    // Create test users
    testUser = await User.create({
      email: 'user@example.com',
      password: await hashPassword('password123'),
      fullName: 'Test User',
      mobile: '0123456789',
      role: 'user',
    })

    shopOwner = await User.create({
      email: 'owner@example.com',
      password: await hashPassword('password123'),
      fullName: 'Shop Owner',
      mobile: '0987654321',
      role: 'owner',
    })

    const admin = await User.create({
      email: 'admin@example.com',
      password: await hashPassword('password123'),
      fullName: 'Admin User',
      mobile: '0111222333',
      role: 'admin',
    })

    // Generate tokens
    userToken = generateToken(testUser._id, testUser.role)
    shopOwnerToken = generateToken(shopOwner._id, shopOwner.role)
    adminToken = generateToken(admin._id, admin.role)

    // Create test shop
    testShop = await Shop.create({
      name: 'Test Shop',
      image: 'test-shop.jpg',
      owner: shopOwner._id,
      city: 'Test City',
      state: 'Test State',
      address: '123 Test Street',
      isActive: true,
    })
  })

  describe('GET /api/shop/get-by-city/:city', () => {
    test('should return shops by city', async () => {
      // Create additional shops
      await Shop.create({
        name: 'Shop 2',
        image: 'shop2.jpg',
        owner: shopOwner._id,
        city: 'Test City',
        state: 'Test State',
        address: '456 Test Avenue',
        isActive: true,
      })

      await Shop.create({
        name: 'Different City Shop',
        image: 'shop3.jpg',
        owner: shopOwner._id,
        city: 'Other City',
        state: 'Other State',
        address: '789 Other Road',
        isActive: true,
      })

      const response = await request(app)
        .get('/api/shop/get-by-city/Test City')
        .set('Cookie', `token=${shopOwnerToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2) // Should find shops in Test City
    })
  })

  describe('GET /api/shop/get-my', () => {
    test("should return shop owner's shop", async () => {
      const response = await request(app)
        .get('/api/shop/get-my')
        .set('Cookie', `token=${shopOwnerToken}`)
        .expect(200)

      expect(response.body.name).toBe('Test Shop')
      expect(response.body.address).toBe('123 Test Street')
      expect(response.body.owner).toBeDefined()
    })

    test('should return 404 if shop owner has no shop', async () => {
      // Create a new owner without a shop
      const newOwner = await User.create({
        email: 'newowner@example.com',
        password: await hashPassword('password123'),
        fullName: 'New Owner',
        mobile: '0555666777',
        role: 'owner',
      })

      const newOwnerToken = generateToken(newOwner._id, newOwner.role)

      const response = await request(app)
        .get('/api/shop/get-my')
        .set('Cookie', `token=${newOwnerToken}`)
        .expect(404)

      expect(response.body.message).toContain('Shop not found')
    })

    test('should require authentication', async () => {
      const response = await request(app).get('/api/shop/get-my').expect(401)
    })
  })

  describe('POST /api/shop/create-edit', () => {
    test('should create shop for shop owner', async () => {
      // Create a new owner without existing shop to test creation
      const newOwner = await User.create({
        email: 'newshopowner@example.com',
        password: await hashPassword('password123'),
        fullName: 'New Shop Owner',
        mobile: '0888999000',
        role: 'owner',
      })

      const newOwnerToken = generateToken(newOwner._id, newOwner.role)

      const shopData = {
        name: 'New Shop',
        city: 'New City',
        state: 'New State',
        address: '456 New Street',
      }

      const response = await request(app)
        .post('/api/shop/create-edit')
        .set('Cookie', `token=${newOwnerToken}`)
        .send(shopData)
        .expect(200)

      expect(response.body.shop).toMatchObject({
        name: shopData.name,
        city: shopData.city,
        state: shopData.state,
        address: shopData.address,
      })

      // Verify shop was created in database
      const shop = await Shop.findOne({ name: shopData.name })
      expect(shop).toBeTruthy()
      expect(shop.owner.toString()).toBe(newOwner._id.toString())
    })

    test('should update existing shop for shop owner', async () => {
      const shopData = {
        name: 'Updated Shop Name',
        city: 'Updated City',
        state: 'Updated State',
        address: 'Updated Address',
      }

      const response = await request(app)
        .post('/api/shop/create-edit')
        .set('Cookie', `token=${shopOwnerToken}`)
        .send(shopData)
        .expect(200)

      expect(response.body.shop.name).toBe(shopData.name)
      expect(response.body.shop.city).toBe(shopData.city)
    })

    test('should require authentication', async () => {
      const shopData = {
        name: 'Unauthenticated Shop',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address',
      }

      await request(app)
        .post('/api/shop/create-edit')
        .send(shopData)
        .expect(401)
    })
  })
})
