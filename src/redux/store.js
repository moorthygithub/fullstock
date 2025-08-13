import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import categoryColumnVisibility from "./categoryColumnVisibilitySlice";
import columnVisibilityReducer from "./columnVisibilitySlice";
import dispatchColumnVisibility from "./dispatchColumnVisibilitySlice";
import sidebarReducer from "./sidebarSlice";
import versionReducer from "./versionSlice";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { persistReducer, persistStore } from "redux-persist";
const encryptor = encryptTransform({
  secretKey: import.meta.env.VITE_SECRET_KEY || "",
  onError: (error) => console.error("Encryption Error:", error),
});
const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "auth",
    "columnVisibility",
    "categorycolumnVisibility",
    "dispatchcolumnVisibility",
    "version",
  ],
  transforms: [encryptor],
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  categorycolumnVisibility: categoryColumnVisibility,
  dispatchcolumnVisibility: dispatchColumnVisibility,
  sidebar: sidebarReducer,
  version: versionReducer,
  columnVisibility: columnVisibilityReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
