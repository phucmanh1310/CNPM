import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userSlice from "./userSlice.js";
import ownerSlice from "./ownerSlice.js";
import mapSlice from "./mapSlice.js";

// Persist config for user slice (only cartItems)
const userPersistConfig = {
    key: "user",
    storage,
    whitelist: ["cartItems"], // Only persist cartItems
};

const persistedUserReducer = persistReducer(userPersistConfig, userSlice);

export const store = configureStore({
    reducer: {
        user: persistedUserReducer,
        owner: ownerSlice,
        map: mapSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }),
});

export const persistor = persistStore(store);

// export const { setUserData, setShopData } = ownerSlice.actions;
