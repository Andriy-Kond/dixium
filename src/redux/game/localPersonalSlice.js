import storage from "redux-persist/lib/storage";
import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { DARK, LIGHT } from "utils/generals/constants.js";

const localInitialState = {
  screens: {}, // Об’єкт виду { "gameId_playerId": screen }
  isShowMask: {}, // Об’єкт виду { "gameId_playerId": Boolean }
  votes: {}, // {"gameId_playerId": {firstVotedCardId: null, secondVotedCardId: null}}
  selectedCardId: {}, // for first story(teller) mode
  isCarouselModeHandScreen: {},
  isCarouselModeTableScreen: {},
  zoomCardId: {},
  toastId: {},

  cardsSet: {},
  // cardsSet: { firstGuessCardSet: null, secondGuessCardSet: null },

  lang: "en",
  theme: LIGHT,

  pageHeaderText: "text",
  pageHeaderBgColor: "#5d7e9e",
  pageHeaderTextColor: "#fff",
  preloadImg: {
    // previewIds: [], // Унікальні publicId прев’ю-зображень
    previewIds: {}, // Унікальні publicId прев’ю-зображень
    totalPreviews: 0, // Загальна кількість унікальних прев’ю
    loadedPreviews: 0, // Кількість завантажених унікальних прев’ю
    preloadUrls: [], // Спільний список URL для предзавантаження
    hasPreloaded: false, // Глобальний прапор щоб не завантажувати дублікати link (Чи виконано предзавантаження)
  },
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
      // console.log("clearLocalState");
      const currentLang = state.lang;
      const currentPreloadImg = state.preloadImg;
      return {
        ...localInitialState,
        lang: currentLang,
        preloadImg: currentPreloadImg,
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

    setCardsSet: (state, action) => {
      const { gameId, playerId, cardsSet } = action.payload;

      const key = `${gameId}_${playerId}`;
      state.cardsSet[key] = cardsSet;
    },

    setLang: (state, action) => {
      state.lang = action.payload;
    },

    toggleTheme: state => {
      state.theme = state.theme === LIGHT ? DARK : LIGHT;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    setPageHeaderText: (state, action) => {
      state.pageHeaderText = action.payload;
    },
    setPageHeaderBgColor: (state, action) => {
      state.pageHeaderBgColor = action.payload;
    },
    setPageHeaderTextColor: (state, action) => {
      state.pageHeaderTextColor = action.payload;
    },

    // & previewIds as array:
    // addPreviewId: (state, action) => {
    //   const publicId = action.payload;
    //   if (!state.preloadImg.previewIds.includes(publicId)) {
    //     state.preloadImg.previewIds.push(publicId);
    //     state.preloadImg.totalPreviews = state.preloadImg.previewIds.length;
    //   }
    // },
    // addPreloadUrl: (state, action) => {
    //   const { url, publicId } = action.payload;
    //   if (!state.preloadImg.preloadUrls.includes(url)) {
    //     state.preloadImg.preloadUrls.push(url);
    //     if (state.preloadImg.previewIds.includes(publicId)) {
    //       state.preloadImg.loadedPreviews += 1;
    //     }
    //   }
    // },
    // setHasPreloaded: state => {
    //   state.preloadImg.hasPreloaded = true;
    // },
    // resetPreload: state => {
    //   state.preloadImg.previewIds = [];
    //   state.preloadImg.totalPreviews = 0;
    //   state.preloadImg.loadedPreviews = 0;
    //   state.preloadImg.preloadUrls = [];
    //   state.preloadImg.hasPreloaded = false;
    // },

    // & previewIds as obj:
    addPreviewId: (state, action) => {
      const publicId = action.payload;
      if (!state.preloadImg.previewIds[publicId]) {
        state.preloadImg.previewIds[publicId] = true;
        state.preloadImg.totalPreviews = Object.keys(
          state.preloadImg.previewIds,
        ).length;
      }
    },
    addPreloadUrl: (state, action) => {
      const { url, publicId } = action.payload;
      if (!state.preloadImg.preloadUrls.includes(url)) {
        state.preloadImg.preloadUrls.push(url);
        if (state.preloadImg.previewIds[publicId]) {
          state.preloadImg.loadedPreviews += 1;
        }
      }
    },
    setHasPreloaded: state => {
      state.preloadImg.hasPreloaded = true;
    },
    resetPreload: state => {
      state.preloadImg.previewIds = {};
      state.preloadImg.totalPreviews = 0;
      state.preloadImg.loadedPreviews = 0;
      state.preloadImg.preloadUrls = [];
      state.preloadImg.hasPreloaded = false;
    },
    setTotalPreviews(state, action) {
      state.preloadImg.totalPreviews = action.payload;
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

  updateVotesLocal,
  setSelectedCardId,
  removeSelectedCardId,
  clearLocalState,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  setZoomCardId,
  setToastId,
  removeToastIdRef,
  setCardsSet,

  setLang,

  toggleTheme,
  setTheme,

  setPageHeaderText,
  setPageHeaderBgColor,
  setPageHeaderTextColor,

  addPreviewId,
  addPreloadUrl,
  setHasPreloaded,
  resetPreload,

  setTotalPreviews,
} = localPersonalSlice.actions;
