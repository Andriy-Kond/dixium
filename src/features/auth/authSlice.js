import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

export const authSlice = createSlice({
  name: "authSlice",
  initialState: {
    userToken: null,
    isLoggedIn: false,
  },

  reducers: {
    setUserToken: (state, action) => {
      state.userToken = action.payload;
    },

    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
  },
});

const persistConfig = {
  key: "authUserToken",
  storage,
  whitelist: ["userToken"],
};

export const persistedUserAuthReducer = persistReducer(
  persistConfig,
  authSlice.reducer,
);

export const { setUserToken, setIsLoggedIn } = authSlice.actions;
