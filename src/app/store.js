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

import { usersApi } from "features/users/usersSlice";

export const store = configureStore({
  reducer: {
    auth: persistedUserAuthReducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },

  middleware: getDefaultMiddleware => [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),

    usersApi.middleware,
  ],
});

export const persistor = persistStore(store);

setupListeners(store.dispatch); // used to enable refetchOnMount and refetchOnReconnect behaviors.
