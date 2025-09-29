import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null
    },
    reducers: {
        setUser(state, action) {
            state.current = action.payload;
        },
        clearUser(state) {
            state.current = null;
        },
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
    }
})
export const { setUser, clearUser } = userSlice.actions;
export const { setUserData, setCurrentCity, setCurrentAddress, setCurrentState } = userSlice.actions
export default userSlice.reducer