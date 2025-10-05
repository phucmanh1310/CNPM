// redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        shopsInMyCity: null,
        itemsInMyCity: null,
        cartItems: [{
            id: null,
            name: null,
            price: null,
            image: null,
            shop: null,
            quantity: null,
            foodType: null,
        }],
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
            state.shopsInMyCity = action.payload  // ← sửa tên
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
        },
        addToCart: (state, action) => {
            const cartItem = action.payload
            const existingItem = state.cartItems.some(i => i.id === cartItem.id)
            if (existingItem) {
                existingItem.quantity += cartItem.quantity
            } else {
                state.cartItems.push(cartItem)
            }
        }
    }
})

export const {
    setUserData,
    setCurrentCity,
    setCurrentAddress,
    setCurrentState,
    setShopsInMyCity,
    setItemsInMyCity,
    addToCart
} = userSlice.actions

export default userSlice.reducer
