import storage from "redux-persist/lib/storage";
import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";

const initialState = {
  screens: {}, // Об’єкт виду { "gameId_playerId": screen }
  isShowMask: {}, // Об’єкт виду { "gameId_playerId": Boolean }
  votes: {}, // {"gameId_playerId": {firstVotedCardId: null, secondVotedCardId: null}}
};

export const localPersonalSlice = createSlice({
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

    setVotesLocal(state, action) {
      // const { gameId, playerId, votes } = action.payload;
      // const key = `${gameId}_${playerId}`;
      // // state.screens = { ...state.screens, key: screen };
      // state.votes[key] = votes;
    },

    resetVotesLocal(state, action) {
      // const { gameId, playerId } = action.payload;
      // const key = `${gameId}_${playerId}`;
      // delete state.votes[key];
    },

    updateVotesLocal: (state, action) => {
      const { gameId, playerId, firstVotedCardId, secondVotedCardId } =
        action.payload;
      console.log("  action.payload:::", action.payload);
      const key = `${gameId}_${playerId}`;
      state.votes[key] = {
        firstVotedCardId,
        secondVotedCardId,
      };
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
  localPersonalSlice.reducer,
);

export const {
  setActiveScreen,
  // forceSetActiveScreen
  removeActiveScreen,
  setIsShowMask,
  setVotesLocal,
  resetVotesLocal,
  updateVotesLocal,
} = localPersonalSlice.actions;
