import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import ownerSlice from "./ownerSlice.js";
import mapSlice from "./mapSlice.js";


export const store = configureStore({
    reducer: {
        user: userSlice,
        owner: ownerSlice,
        map: mapSlice,
    }
});

// export const { setUserData, setShopData } = ownerSlice.actions;
