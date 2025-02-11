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
import { persistedUserAuthReducer } from "features/auth/authSlice";

import { usersApi } from "features/users/usersApi";
import { gameApi } from "features/game/gameApi.js";
import { persistedGameReducer } from "features/game/gameSlice.js";
import { gameResetMiddleware } from "features/game/gameResetMiddleware.js";

export const store = configureStore({
  reducer: {
    authSlice: persistedUserAuthReducer,
    gameSlice: persistedGameReducer,
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
    gameResetMiddleware,
  ],
});

export const persistor = persistStore(store);

setupListeners(store.dispatch); // used to enable refetchOnMount and refetchOnReconnect behaviors.
