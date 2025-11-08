import {
  getUserOrdersPaginated,
  getOwnerOrdersPaginated,
  getUserSpendingStats,
  getShopRevenueStats,
} from '../../controllers/order.controller.js'
import Order from '../../models/order.model.js'

// Mock Order model
jest.mock('../../models/order.model.js')

describe('Order Pagination Controller', () => {
  let req, res

  beforeEach(() => {
    req = {
      userId: 'user123',
      query: {},
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    jest.clearAllMocks()
  })

  describe('getUserOrdersPaginated', () => {
    it('should return paginated orders with default params', async () => {
      const mockOrders = [
        { _id: 'order1', total: 100 },
        { _id: 'order2', total: 200 },
      ]

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockOrders),
      })

      Order.countDocuments = jest.fn().mockResolvedValue(2)

      await getUserOrdersPaginated(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        orders: mockOrders,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalOrders: 2,
          limit: 10,
        },
      })
    })

    it('should handle pagination with page and limit', async () => {
      req.query = { page: '2', limit: '5' }

      const mockOrders = [{ _id: 'order3' }]

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockOrders),
      })

      Order.countDocuments = jest.fn().mockResolvedValue(12)

      await getUserOrdersPaginated(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        orders: mockOrders,
        pagination: {
          currentPage: 2,
          totalPages: 3,
          totalOrders: 12,
          limit: 5,
        },
      })
    })

    it('should filter by search query', async () => {
      req.query = { search: 'test123' }

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      })

      Order.countDocuments = jest.fn().mockResolvedValue(0)

      await getUserOrdersPaginated(req, res)

      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'user123',
          $or: expect.any(Array),
        })
      )
    })

    it('should filter by status', async () => {
      req.query = { status: 'delivered' }

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      })

      Order.countDocuments = jest.fn().mockResolvedValue(0)

      await getUserOrdersPaginated(req, res)

      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'shopOrder.status': 'delivered',
        })
      )
    })

    it('should handle errors', async () => {
      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      await getUserOrdersPaginated(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Database error'),
        })
      )
    })
  })

  describe('getOwnerOrdersPaginated', () => {
    it('should return paginated orders for shop owner', async () => {
      req.userId = 'owner123'

      const mockOrders = [{ _id: 'order1', shopOrder: { owner: 'owner123' } }]

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockOrders),
      })

      Order.countDocuments = jest.fn().mockResolvedValue(1)

      await getOwnerOrdersPaginated(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'shopOrder.owner': 'owner123',
        })
      )
    })
  })

  describe('getUserSpendingStats', () => {
    it('should return spending statistics for last 7 days', async () => {
      const mockStats = [
        { _id: '2025-11-01', totalSpent: 100, orderCount: 2 },
        { _id: '2025-11-02', totalSpent: 150, orderCount: 1 },
      ]

      Order.aggregate = jest.fn().mockResolvedValue(mockStats)

      await getUserSpendingStats(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        dailyStats: mockStats,
        summary: {
          totalSpent: 250,
          totalOrders: 3,
          averageOrderValue: 250 / 3,
          period: '7 days',
        },
      })
    })

    it('should handle no orders case', async () => {
      Order.aggregate = jest.fn().mockResolvedValue([])

      await getUserSpendingStats(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        dailyStats: [],
        summary: {
          totalSpent: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          period: '7 days',
        },
      })
    })

    it('should handle errors', async () => {
      Order.aggregate = jest
        .fn()
        .mockRejectedValue(new Error('Aggregation error'))

      await getUserSpendingStats(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Aggregation error'),
        })
      )
    })
  })

  describe('getShopRevenueStats', () => {
    it('should return revenue statistics for shop owner', async () => {
      req.userId = 'owner123'

      const mockStats = [
        { _id: '2025-11-01', totalRevenue: 500, orderCount: 5 },
        { _id: '2025-11-02', totalRevenue: 300, orderCount: 3 },
      ]

      Order.aggregate = jest.fn().mockResolvedValue(mockStats)

      await getShopRevenueStats(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        dailyStats: mockStats,
        summary: {
          totalRevenue: 800,
          totalOrders: 8,
          averageOrderValue: 100,
          period: '7 days',
        },
      })
    })

    it('should calculate average correctly with zero orders', async () => {
      Order.aggregate = jest.fn().mockResolvedValue([])

      await getShopRevenueStats(req, res)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({
            averageOrderValue: 0,
          }),
        })
      )
    })
  })
})
