import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { persistedUserAuthReducer } from "redux/auth/authSlice";

import { usersApi } from "redux/auth/authApi";
import { gameApi } from "redux/game/gameApi.js";
import { persistedGameReducer } from "redux/game/gameSlice.js";
import optimisticUpdateMiddleware from "redux/middlewares/optimisticUpdateMiddleware.js";
import { persistedActiveScreenReducer } from "./game/localPersonalSlice.js";

export const store = configureStore({
  reducer: {
    authSlice: persistedUserAuthReducer,
    gameSlice: persistedGameReducer,
    localPersonalSlice: persistedActiveScreenReducer,

    [usersApi.reducerPath]: usersApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
  },

  middleware: getDefaultMiddleware => [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),

    usersApi.middleware,
    gameApi.middleware,
    optimisticUpdateMiddleware,
    // Перевірка серіалізації
    // optimisticUpdateMiddleware додає action.meta = { timer }, де timer — це ID таймера (число), що є еріалізованим типом. Тому проблем із serializableCheck не буде. Але якщо ти додаси несеріалізовані об’єкти (наприклад, функції), тобі доведеться додати свій type у ignoredActions.
  ],
});

export const persistor = persistStore(store);

setupListeners(store.dispatch); // used to enable refetchOnMount and refetchOnReconnect behaviors.
