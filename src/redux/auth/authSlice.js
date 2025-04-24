import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const authInitialState = {
  // userToken: null,
  isLoggedIn: false,
  user: {
    // _id,
    // name,
    // email,
    // token,
    // avatarURL,
    // playerGameId,
    // userActiveGameId,
  },
};

export const authSlice = createSlice({
  name: "authSlice",
  initialState: authInitialState,

  reducers: {
    // setUserToken: (state, action) => {
    //   state.userToken = action.payload;
    // },

    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },

    logoutUser: state => {
      // state.token = null;
      state.isLoggedIn = false;
      state.user = {};
    },

    setUserCredentials: (state, action) => {
      state.user = action.payload;
      // console.log(" action.payload:::", action.payload);
    },

    clearAuthInitialState: () => authInitialState,
  },
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
  // setUserToken,
  setIsLoggedIn,
  logoutUser,
  setUserCredentials,
  clearAuthInitialState,
} = authSlice.actions;
