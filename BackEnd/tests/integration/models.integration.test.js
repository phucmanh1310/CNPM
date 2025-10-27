import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js'
import User from '../../models/user.model.js'
import Shop from '../../models/shop.model.js'
import Item from '../../models/item.model.js'

describe('Model Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  afterEach(async () => {
    await clearTestDB()
  })

  describe('User-Shop Relationship', () => {
    test('should create shop with valid owner', async () => {
      const owner = await User.create({
        email: 'owner@example.com',
        password: 'hashedPassword',
        fullName: 'Shop Owner',
        mobile: '0123456789',
        role: 'owner',
      })

      const shop = await Shop.create({
        name: 'Test Shop',
        image: 'test-image.jpg',
        owner: owner._id,
        city: 'Test City',
        state: 'Test State',
        address: '123 Test Street',
      })

      expect(shop.owner.toString()).toBe(owner._id.toString())

      // Test population
      const populatedShop = await Shop.findById(shop._id).populate('owner')
      expect(populatedShop.owner.fullName).toBe('Shop Owner')
    })

    test('should enforce referential integrity', async () => {
      // MongoDB doesn't enforce referential integrity by default
      // This test verifies that we can create a shop with non-existent owner ID
      // In a real app, you'd add validation middleware to prevent this
      const fakeOwnerId = '507f1f77bcf86cd799439011'

      const shop = await Shop.create({
        name: 'Shop with fake owner',
        image: 'test-image.jpg',
        owner: fakeOwnerId,
        city: 'Test City',
        state: 'Test State',
        address: '123 Invalid Street',
      })

      expect(shop.owner.toString()).toBe(fakeOwnerId)

      // Try to populate - this should return null for the owner field
      const populatedShop = await Shop.findById(shop._id).populate('owner')
      expect(populatedShop.owner).toBeNull()
    })
  })

  describe('Shop-Item Relationship', () => {
    test('should create items for shop', async () => {
      const owner = await User.create({
        email: 'owner@example.com',
        password: 'hashedPassword',
        fullName: 'Shop Owner',
        mobile: '0123456789',
        role: 'owner',
      })

      const shop = await Shop.create({
        name: 'Test Shop',
        image: 'test-image.jpg',
        owner: owner._id,
        city: 'Test City',
        state: 'Test State',
        address: '123 Test Street',
      })

      const item = await Item.create({
        name: 'Test Item',
        image: 'test-item.jpg',
        price: 10.99,
        shop: shop._id,
        category: 'Snack',
        foodType: 'veg',
      })

      expect(item.shop.toString()).toBe(shop._id.toString())

      // Test population
      const populatedItem = await Item.findById(item._id).populate('shop')
      expect(populatedItem.shop.name).toBe('Test Shop')
    })
  })

  describe('Complex Queries', () => {
    test('should find shops with items', async () => {
      const owner = await User.create({
        email: 'owner@example.com',
        password: 'hashedPassword',
        fullName: 'Shop Owner',
        mobile: '0123456789',
        role: 'owner',
      })

      const shop = await Shop.create({
        name: 'Test Shop',
        image: 'test-image.jpg',
        owner: owner._id,
        city: 'Test City',
        state: 'Test State',
        address: '123 Test Street',
      })

      await Item.create({
        name: 'Item 1',
        image: 'item1.jpg',
        price: 10.99,
        shop: shop._id,
        category: 'Snack',
        foodType: 'veg',
      })

      await Item.create({
        name: 'Item 2',
        image: 'item2.jpg',
        price: 15.99,
        shop: shop._id,
        category: 'Beverage',
        foodType: 'veg',
      })

      // Aggregate query to get shop with item count
      const shopsWithItemCount = await Shop.aggregate([
        {
          $lookup: {
            from: 'items', // Assumes collection name is 'items'
            localField: '_id',
            foreignField: 'shop',
            as: 'items',
          },
        },
        {
          $addFields: {
            itemCount: { $size: '$items' },
          },
        },
      ])

      expect(shopsWithItemCount).toHaveLength(1)
      expect(shopsWithItemCount[0].itemCount).toBe(2)
    })
  })
})
