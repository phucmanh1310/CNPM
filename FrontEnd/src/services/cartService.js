import axios from '../utils/axios'

class CartService {
  constructor() {
    this.api = axios
  }

  // Get user's cart
  async getCart() {
    try {
      const response = await this.api.get('/cart')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Add item to cart
  async addToCart(itemId, quantity = 1) {
    try {
      const response = await this.api.post('/cart/add', { itemId, quantity })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await this.api.put(`/cart/update/${itemId}`, {
        quantity,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const response = await this.api.delete(`/cart/remove/${itemId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      const response = await this.api.delete('/cart/clear')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default new CartService()
