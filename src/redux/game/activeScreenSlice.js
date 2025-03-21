import storage from "redux-persist/lib/storage";
import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";

const initialState = {
  screens: {}, // Об’єкт виду { "gameId_playerId": screen }
  isShowMask: {}, // Об’єкт виду { "gameId_playerId": Boolean }
};

export const activeScreenSlice = createSlice({
  name: "activeScreen",
  initialState,
  reducers: {
    // When user set screen by himself
    setActiveScreen(state, action) {
      const { gameId, playerId, screen } = action.payload;
      const key = `${gameId}_${playerId}`;

      // state.screens = { ...state.screens, key: screen };
      state.screens[key] = screen;
    },

    // When screen setts by server pushing
    // forceSetActiveScreen(state, action) {
    //   const { gameId, screen } = action.payload;
    //   Object.keys(state.screens).forEach(key => {
    //     if (key.startsWith(`${gameId}_`)) {
    //       state.screens[key] = screen;
    //     }
    //   });
    // },

    removeActiveScreen(state, action) {
      const { gameId, playerId } = action.payload;
      const key = `${gameId}_${playerId}`;

      // state.screens = { ...state.screens, key: screen };
      delete state.screens[key];
    },

    setIsShowMask(state, action) {
      const { gameId, playerId, isShow } = action.payload;
      const key = `${gameId}_${playerId}`;
      state.isShowMask[key] = isShow;
    },
  },
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

export const persistedActiveScreenReducer = persistReducer(
  persistConfig,
  activeScreenSlice.reducer,
);

export const {
  setActiveScreen,
  // forceSetActiveScreen
  removeActiveScreen,
  setIsShowMask,
} = activeScreenSlice.actions;
