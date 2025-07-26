import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Import storage for persistence
import authReducer from './slices/authSlice';
import chatSlice from './slices/chatSlice';
import promptSlice from "./slices/promptSlices";
import slugDetailSlice from './slices/slugdetailSlice'
import courseSlice from './slices/createSlice'
import priviewSlice from './slices/previewSlice'

const persistConfig = {
  key: "root",
  storage,
  whitelist: ['auth'], // Persist all three slices
};

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatSlice,
  prompt: promptSlice,
  slag: slugDetailSlice,
  couseCreate: courseSlice,
  priview: priviewSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PURGE", "persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
