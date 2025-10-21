// redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopsInMyCity: null,
    itemsInMyCity: null,
    cartItems: [], // ← SỬA: Mảng trống thay vì [{...}]
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload
    },
    setShopsInMyCity: (state, action) => {
      state.shopsInMyCity = action.payload
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload
    },
    addToCart: (state, action) => {
      const cartItem = action.payload
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === cartItem.id
      )

      if (existingItemIndex >= 0) {
        // Nếu item đã tồn tại, cập nhật quantity
        state.cartItems[existingItemIndex].quantity += cartItem.quantity
      } else {
        // Nếu item chưa có, thêm mới
        state.cartItems.push(cartItem)
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      )
    },
    clearCart: (state) => {
      state.cartItems = []
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const itemIndex = state.cartItems.findIndex((item) => item.id === id)
      if (itemIndex >= 0 && quantity > 0) {
        state.cartItems[itemIndex].quantity = quantity
      } else if (itemIndex >= 0 && quantity <= 0) {
        state.cartItems.splice(itemIndex, 1)
      }
    },
  },
})

export const {
  setUserData,
  setCurrentCity,
  setCurrentAddress,
  setCurrentState,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
} = userSlice.actions

export default userSlice.reducer
