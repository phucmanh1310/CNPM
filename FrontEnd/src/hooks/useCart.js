import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cartService from '../services/cartService'
import { addToCart, clearCart } from '../redux/userSlice'
import { toast } from 'react-toastify'

export const useCart = () => {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.user.cartItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load cart from server
  const loadCart = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartService.getCart()
      // Update Redux store with server data
      dispatch(clearCart()) // Clear existing items
      response.items.forEach((item) => {
        dispatch(
          addToCart({
            id: item.item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            shop: item.shop._id,
            shopName: item.shop.name,
            image: item.item.image,
          })
        )
      })
    } catch (err) {
      setError(err.message || 'Failed to load cart')
      console.error('Load cart error:', err)
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // Add item to cart
  const addItemToCart = useCallback(
    async (itemId, quantity = 1) => {
      try {
        setLoading(true)
        setError(null)
        const response = await cartService.addToCart(itemId, quantity)

        // Update Redux store
        dispatch(clearCart())
        response.cart.items.forEach((item) => {
          dispatch(
            addToCart({
              id: item.item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              shop: item.shop._id,
              shopName: item.shop.name,
              image: item.item.image,
            })
          )
        })

        toast.success('Item added to cart successfully')
      } catch (err) {
        setError(err.message || 'Failed to add item to cart')
        toast.error(err.message || 'Failed to add item to cart')
        console.error('Add to cart error:', err)
      } finally {
        setLoading(false)
      }
    },
    [dispatch]
  )

  // Update cart item quantity
  const updateItemQuantity = useCallback(
    async (itemId, quantity) => {
      try {
        setLoading(true)
        setError(null)
        const response = await cartService.updateCartItem(itemId, quantity)

        // Update Redux store
        dispatch(clearCart())
        response.cart.items.forEach((item) => {
          dispatch(
            addToCart({
              id: item.item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              shop: item.shop._id,
              shopName: item.shop.name,
              image: item.item.image,
            })
          )
        })

        toast.success('Cart updated successfully')
      } catch (err) {
        setError(err.message || 'Failed to update cart item')
        toast.error(err.message || 'Failed to update cart item')
        console.error('Update cart item error:', err)
      } finally {
        setLoading(false)
      }
    },
    [dispatch]
  )

  // Remove item from cart
  const removeItemFromCart = useCallback(
    async (itemId) => {
      try {
        setLoading(true)
        setError(null)
        const response = await cartService.removeFromCart(itemId)

        // Update Redux store
        dispatch(clearCart())
        response.cart.items.forEach((item) => {
          dispatch(
            addToCart({
              id: item.item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              shop: item.shop._id,
              shopName: item.shop.name,
              image: item.item.image,
            })
          )
        })

        toast.success('Item removed from cart')
      } catch (err) {
        setError(err.message || 'Failed to remove item from cart')
        toast.error(err.message || 'Failed to remove item from cart')
        console.error('Remove from cart error:', err)
      } finally {
        setLoading(false)
      }
    },
    [dispatch]
  )

  // Clear entire cart
  const clearCartItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await cartService.clearCart()
      dispatch(clearCart())
      toast.success('Cart cleared successfully')
    } catch (err) {
      setError(err.message || 'Failed to clear cart')
      toast.error(err.message || 'Failed to clear cart')
      console.error('Clear cart error:', err)
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // Calculate total price
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }, [cartItems])

  // Get total items count
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  return {
    cartItems,
    loading,
    error,
    loadCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCartItems,
    getTotalPrice,
    getTotalItems,
  }
}
