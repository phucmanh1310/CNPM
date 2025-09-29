import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import ownerSlice from "./ownerSlice.js";

export const store = configureStore({
    reducer: {
        user: userSlice,
        owner: ownerSlice
    }
});

// export const { setUserData, setShopData } = ownerSlice.actions;
