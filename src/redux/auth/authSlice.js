import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authApi } from "./authApi.js";

const authInitialState = {
  isLoggedIn: false,
  user: {
    // _id,
    // name,
    // email,
    // token, // буде видалений у майбутньому
    // avatarURL,
    // playerGameId: null,
  },
};

export const authSlice = createSlice({
  name: "authSlice",
  initialState: authInitialState,

  reducers: {
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },

    logoutUser: state => {
      // state.token = null;
      state.isLoggedIn = false;
      state.user = {};
    },

    setUserCredentials: (state, action) => {
      console.log("setUserCredentials:", action.payload);
      const { userActiveGameId, ...userData } = action.payload; // Ізоляція userActiveGameId
      state.user = userData; // setUserActiveGameId використовується у локальному стані, щоб запобігати оновленню усіх компонентів
      // state.isLoggedIn = true; //!!! Оновлюємо isLoggedIn тут
    },

    clearAuthInitialState: () => authInitialState,
  },

  // Для автоматичного оновлення поточного стану після кожного запиту getUserByToken: (чи потрібно?)
  //!!! extraReducers: builder => {
  //   builder.addMatcher(
  //     authApi.endpoints.getUserByToken.matchFulfilled,
  //     (state, { payload }) => {
  //       const { userActiveGameId, ...userData } = payload; // Ізоляція userActiveGameId
  //       state.user = userData;
  //       state.isLoggedIn = true;
  //     },
  //   );
  // },
});

const persistConfig = {
  key: "authUserToken",
  storage,
};

export const persistedUserAuthReducer = persistReducer(
  persistConfig,
  authSlice.reducer,
);

export const {
  setIsLoggedIn,
  logoutUser,
  setUserCredentials,
  clearAuthInitialState,
} = authSlice.actions;
