import Cart from '../models/cart.model.js'
import Item from '../models/item.model.js'
import Shop from '../models/shop.model.js'

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId })
      .populate({
        path: 'items.item',
        select: 'name image price',
      })
      .populate({
        path: 'items.shop',
        select: 'name',
      })

    if (!cart) {
      return res.status(200).json({ items: [] })
    }

    return res.status(200).json(cart)
  } catch (error) {
    return res.status(500).json({ message: `Get cart error: ${error.message}` })
  }
}

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' })
    }

    // Get item details
    const item = await Item.findById(itemId).populate('shop', 'name')
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.userId })

    if (!cart) {
      cart = new Cart({
        user: req.userId,
        items: [],
      })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.item.toString() === itemId
    )

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        item: itemId,
        name: item.name,
        price: item.price,
        quantity: quantity,
        shop: item.shop._id,
      })
    }

    await cart.save()

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.item',
        select: 'name image price',
      })
      .populate({
        path: 'items.shop',
        select: 'name',
      })

    return res.status(200).json({
      message: 'Item added to cart successfully',
      cart: updatedCart,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Add to cart error: ${error.message}` })
  }
}

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' })
    }

    const cart = await Cart.findOne({ user: req.userId })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.item.toString() === itemId
    )

    if (itemIndex < 0) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }

    await cart.save()

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.item',
        select: 'name image price',
      })
      .populate({
        path: 'items.shop',
        select: 'name',
      })

    return res.status(200).json({
      message: 'Cart item updated successfully',
      cart: updatedCart,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update cart item error: ${error.message}` })
  }
}

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' })
    }

    const cart = await Cart.findOne({ user: req.userId })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = cart.items.filter((item) => item.item.toString() !== itemId)

    await cart.save()

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.item',
        select: 'name image price',
      })
      .populate({
        path: 'items.shop',
        select: 'name',
      })

    return res.status(200).json({
      message: 'Item removed from cart successfully',
      cart: updatedCart,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Remove from cart error: ${error.message}` })
  }
}

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = []
    await cart.save()

    return res.status(200).json({
      message: 'Cart cleared successfully',
      cart: { ...cart.toObject(), items: [] },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Clear cart error: ${error.message}` })
  }
}
