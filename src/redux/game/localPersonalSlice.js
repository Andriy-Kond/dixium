import storage from "redux-persist/lib/storage";
import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";

const localInitialState = {
  screens: {}, // Об’єкт виду { "gameId_playerId": screen }
  isShowMask: {}, // Об’єкт виду { "gameId_playerId": Boolean }
  votes: {}, // {"gameId_playerId": {firstVotedCardId: null, secondVotedCardId: null}}
  selectedCardId: {}, // for first story(teller) mode
  isCarouselModeHandScreen: {},
  isCarouselModeTableScreen: {},
  zoomCardId: {},
  toastId: {},
  lang: "en",
};

export const localPersonalSlice = createSlice({
  name: "activeScreen",
  initialState: localInitialState,
  reducers: {
    // When user set screen by himself
    setActiveScreen(state, action) {
      const { gameId, playerId, screen } = action.payload;
      const key = `${gameId}_${playerId}`;

      // state.screens = { ...state.screens, key: screen };
      state.screens[key] = screen;
    },

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
      const key = `${gameId}_${playerId}`;
      state.votes[key] = {
        firstVotedCardId,
        secondVotedCardId,
      };
    },

    setSelectedCardId: (state, action) => {
      const { gameId, playerId, selectedCardId } = action.payload;
      const key = `${gameId}_${playerId}`;
      state.selectedCardId[key] = selectedCardId;
    },

    removeSelectedCardId: (state, action) => {
      const { gameId, playerId } = action.payload;
      const key = `${gameId}_${playerId}`;
      delete state.selectedCardId[key];
    },

    clearLocalState: state => {
      const currentLang = state.lang;
      return {
        ...localInitialState,
        lang: currentLang,
      };
    },

    setIsCarouselModeHandScreen: (state, action) => {
      const { gameId, playerId, isCarouselModeHandScreen } = action.payload;
      const key = `${gameId}_${playerId}`;
      state.isCarouselModeHandScreen[key] = isCarouselModeHandScreen;
    },

    setIsCarouselModeTableScreen: (state, action) => {
      const { gameId, playerId, isCarouselModeTableScreen } = action.payload;
      const key = `${gameId}_${playerId}`;
      state.isCarouselModeTableScreen[key] = isCarouselModeTableScreen;
    },

    setZoomCardId: (state, action) => {
      const { gameId, playerId, zoomCardId } = action.payload;
      const key = `${gameId}_${playerId}`;
      state.zoomCardId[key] = zoomCardId;
    },

    setToastId: (state, action) => {
      const { gameId, playerId, toastId } = action.payload;
      const key = `${gameId}_${playerId}`;
      state.selectedCardId[key] = toastId;
    },

    removeToastIdRef: (state, action) => {
      const { gameId, playerId } = action.payload;
      const key = `${gameId}_${playerId}`;
      delete state.selectedCardId[key];
    },

    setLang: (state, action) => {
      state.lang = action.payload;
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
  removeActiveScreen,
  setIsShowMask,
  removeIsShowMask,
  setVotesLocal,
  resetVotesLocal,
  updateVotesLocal,
  setSelectedCardId,
  removeSelectedCardId,
  clearLocalState,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  setZoomCardId,
  setToastId,
  removeToastIdRef,
  setLang,
} = localPersonalSlice.actions;
