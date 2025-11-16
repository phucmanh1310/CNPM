import request from 'supertest'
jest.mock('../../utils/cloudinary.js', () => {
  return {
    __esModule: true,
    default: jest.fn(async () => 'https://example.com/test.jpg'),
  }
})
import { setupTestDB, teardownTestDB, clearTestDB, app } from './setup.js'
import User from '../../models/user.model.js'
import path from 'path'
import Shop from '../../models/shop.model.js'
import Item from '../../models/item.model.js'
import { hashPassword, generateToken } from '../../utils/auth.js'

describe('Item API Integration', () => {
  let owner
  let ownerToken
  let shop
  let itemId

  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()

    owner = await User.create({
      email: 'owner@example.com',
      password: await hashPassword('password123'),
      fullName: 'Owner',
      mobile: '0123456789',
      role: 'owner',
    })

    ownerToken = generateToken(owner._id, owner.role)

    shop = await Shop.create({
      name: 'Owner Shop',
      owner: owner._id,
      city: 'TestCity',
      state: 'TestState',
      address: '123 Test',
      pincode: '111111',
    })

    const item = await Item.create({
      name: 'Existing Item',
      shop: shop._id,
      price: 100,
      image: 'x.jpg',
      category: 'Snack',
      description: 'desc',
      foodType: 'veg',
    })

    itemId = item._id
  })

  test('POST /api/item/add-item - owner adds item', async () => {
    const imagePath = path.join(__dirname, '..', 'fixtures', 'test-image.jpg')
    const response = await request(app)
      .post('/api/item/add-item')
      .set('Cookie', [`token=${ownerToken}`])
      .field('name', 'New Item')
      .field('price', 50)
      .field('category', 'Beverage')
      .field('foodType', 'veg')
      .field('image', 'https://example.com/test.jpg')
      .attach('image', imagePath)

    if (response.statusCode !== 201) {
      console.log('ADD_ITEM_RESPONSE:', response.body)
    }
    expect(response.statusCode).toBe(201)

    expect(response.body._id).toBeDefined()
    expect(response.body.item).toBeDefined()
  })

  test('GET /api/item/:itemId - returns item', async () => {
    const res = await request(app)
      .get(`/api/item/${itemId}`)
      .set('Cookie', [`token=${ownerToken}`])
      .expect(200)

    expect(res.body.name).toBe('Existing Item')
  })

  test('PUT /api/item/edit-item/:itemId - edit item', async () => {
    const res = await request(app)
      .put(`/api/item/edit-item/${itemId}`)
      .set('Cookie', [`token=${ownerToken}`])
      .send({ name: 'Updated Item' })
      .expect(200)

    expect(res.body.name).toBe('Updated Item')
  })

  test('DELETE /api/item/delete-item/:itemId - delete item', async () => {
    await request(app)
      .delete(`/api/item/delete-item/${itemId}`)
      .set('Cookie', [`token=${ownerToken}`])
      .expect(200)

    const found = await Item.findById(itemId)
    expect(found).toBeNull()
  })

  test('GET /api/item/get-by-city/:city - returns items for city', async () => {
    const res = await request(app)
      .get('/api/item/get-by-city/TestCity')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})
