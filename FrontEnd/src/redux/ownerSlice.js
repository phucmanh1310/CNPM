import { createSlice } from '@reduxjs/toolkit'
const ownerSlice = createSlice({
  name: 'owner',
  initialState: {
    myShopData: undefined,
  },
  reducers: {
    setMyShopData: (state, action) => {
      state.myShopData = action.payload
    },
  },
})

export const { setMyShopData } = ownerSlice.actions
export default ownerSlice.reducer
