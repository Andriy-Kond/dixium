import storage from "redux-persist/lib/storage";
import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { EN, LIGHT } from "utils/generals/constants.js";

const localInitialState = {
  games: {},
  screens: {}, // Об’єкт виду { "gameId_playerId": screen }
  isShowMask: {}, // Об’єкт виду { "gameId_playerId": Boolean }
  votes: {}, // {"gameId_playerId": {firstVotedCardId: null, secondVotedCardId: null}}
  isCarouselModeHandScreen: {},
  isCarouselModeTableScreen: {},
  // componentHeight: 0,
  componentHeight: 0,
  isHeightReady: false,

  cardsSet: {}, // cardsSet: { firstGuessCardSet: null, secondGuessCardSet: null },
  selectedCardId: {}, // for first story(teller) mode

  pageHeaderText: "",
  pageHeaderTextSecond: "",

  preloadImg: {
    // previewIds: [], // Унікальні publicId прев’ю-зображень
    previewIds: {}, // Унікальні publicId прев’ю-зображень
    totalPreviews: 0, // Загальна кількість унікальних прев’ю
    loadedPreviews: 0, // Кількість завантажених унікальних прев’ю
    preloadUrls: [], // Спільний список URL для предзавантаження
    hasPreloaded: false, // Глобальний прапор щоб не завантажувати дублікати link (Чи виконано предзавантаження)
  },

  notification: {
    message: null,
    duration: 1000,
    type: "info", // Для стилізації (success, error, info)
  },

  isSetPassword: false,
  userActiveGameId: null,

  // Non delete options:
  lang: EN, // en, uk, auto
  theme: LIGHT, // light, dark
  visualTheme: LIGHT, // light, dark, auto

  locationFrom: null,
};

export const localPersonalSlice = createSlice({
  name: "activeScreen",
  initialState: localInitialState,
  reducers: {
    // addLocalGamesList: (state, action) => {
    //   state.games = action.payload;
    // },

    setLocationFrom: (state, action) => {
      state.locationFrom = action.payload;
    },

    setComponentHeight: (state, action) => {
      // console.log("  action.payload:::", action.payload);
      state.componentHeight = action.payload;
    },

    setIsHeightReady: (state, action) => {
      state.isHeightReady = action.payload;
    },

    setVisualTheme: (state, action) => {
      state.visualTheme = action.payload;
    },

    setGameDeck: (state, action) => {
      const { gameId, cards } = action.payload;
      // console.log("setGameDeck cards:::", cards);
      // console.log("setGameDeck gameId:::", gameId);
      const game = state.games[gameId];
      if (game) state.games[gameId].deck = cards;
    },

    deleteCardsFromDeck: (state, action) => {
      const { gameId, removingCards } = action.payload;
      // console.log("deleteCardsFromDeck gameId:::", gameId);
      // console.log("deleteCardsFromDeck removingCards:::", removingCards);
      const game = state.games[gameId];
      if (game) {
        state.games[gameId].deck = state.games[gameId].deck.filter(
          card => !removingCards.some(rc => rc._id === card._id),
        );
      }
    },

    toggleIsSingleCardMode: (state, action) => {
      const { gameId } = action.payload;
      const game = state.games[gameId];
      if (game)
        state.games[gameId].isSingleCardMode =
          !state.games[gameId].isSingleCardMode;
    },

    setFinishPoints: (state, action) => {
      const { gameId, finishPoints } = action.payload;
      const game = state.games[gameId];
      // console.log({ gameId: game._id, finishP: game.finishPoints });

      if (game) state.games[gameId].finishPoints = Number(finishPoints);
    },

    setLocalGame: (state, action) => {
      // console.trace("localPersonalSlice>> setLocalGame");
      // console.log(
      //   " localPersonalSlice>> setLocalGame action.payload:::",
      //   action.payload?.gameName,
      // );

      const game = action.payload;

      // state.games = { ...state.games, [game._id]: game };
      if (game) {
        console.log("game exist");
        state.games[game._id] = game; // add new or update exist
      } else if (state.games[game?._id]) {
        console.log("game NOT exist");
        delete state.games[game._id];
      }
      return;
    },

    updatePlayers: (state, action) => {
      const game = action.payload;
      if (state.games[game._id]) state.games[game._id].players = game.players;
    },

    removeUserFromGame: (state, action) => {
      const { game, deletedUser } = action.payload;
      // console.log(" game:::", game);
      // console.log(" deletedUser:::", deletedUser);
      if (!game || !deletedUser) return;
      // if (!state.games[game._id]) return;

      state.games[game._id].players = state.games[game._id].players.filter(
        player => player._id !== deletedUser._id,
      );

      // скидаю його карти у відбій
      state.games[game._id].discardPile = game.discardPile;
    },

    setLocalGameStatus: (state, action) => {
      const { gameId, status } = action.payload;
      const game = state.games[gameId];
      if (game) state.games[gameId].gameStatus = status;
    },

    updateLocalGame: (state, action) => {
      const updatedGame = action.payload;
      state.games[updatedGame._id] = updatedGame;
    },

    // setFoundGameId: (state, action) => {
    //   state.foundGameId = action.payload;
    // },

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

    clearLocalStateForLogout: (state, action) => {
      const currentLang = state.lang;
      const currentTheme = state.theme;
      const currentVisualTheme = state.visualTheme;

      return {
        ...localInitialState,
        lang: currentLang,
        theme: currentTheme,
        visualTheme: currentVisualTheme,
      };
    },

    clearLocalStateForGameDelete: (state, action) => {
      const gameId = action.payload;
      const games = state.games;
      // .fromEntries перетворює відфільтрований масив пар назад в об'єкт
      // .entries перетворює об'єкт state.games у масив пар [key, value]
      const updateGameList = Object.fromEntries(
        Object.entries(games).filter(([key]) => key !== gameId),
      );
      const currentLang = state.lang;
      const currentTheme = state.theme;
      const currentVisualTheme = state.visualTheme;
      const newPageHeaderText = state.pageHeaderText;
      const newPageHeaderTextSecond = state.pageHeaderTextSecond;

      return {
        ...localInitialState,
        games: { ...updateGameList },
        lang: currentLang,
        theme: currentTheme,
        visualTheme: currentVisualTheme,
        pageHeaderText: newPageHeaderText,
        pageHeaderTextSecond: newPageHeaderTextSecond,
      };
    },

    // deleteLocalGame: (state, action) => {
    //   const game = action.payload;
    //   if (state.games[game._id]) delete state.games[game._id];
    // },

    clearLocalGames: (state, action) => {
      state.games = {};
    },

    clearLocalStateForNewRound: (state, action) => {
      state.votes = {};
      state.notification = {
        message: null,
        duration: 1000,
        type: "info",
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

    setCardsSet: (state, action) => {
      const { gameId, playerId, cardsSet } = action.payload;

      const key = `${gameId}_${playerId}`;
      state.cardsSet[key] = cardsSet;
    },

    setLang: (state, action) => {
      state.lang = action.payload;
    },

    // toggleTheme: state => {
    //   state.theme = state.theme === LIGHT ? DARK : LIGHT;
    // },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    setPageHeaderText: (state, action) => {
      state.pageHeaderText = action.payload;
    },
    setPageHeaderTextSecond: (state, action) => {
      state.pageHeaderTextSecond = action.payload;
    },

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
    setTotalPreviews: (state, action) => {
      state.preloadImg.totalPreviews = action.payload;
    },

    setIsSetPassword: (state, action) => {
      state.isSetPassword = action.payload;
    },

    setUserActiveGameId: (state, action) => {
      state.userActiveGameId = action.payload;
    },

    showNotification(state, action) {
      state.notification.message = action.payload.message || "empty message";
      state.notification.duration = action.payload.duration || 3000;
      state.notification.type = action.payload.type || "info";
    },

    hideNotification(state) {
      state.notification.message = null;
      state.notification.duration = 3000;
      state.notification.type = "info";
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
  setLocationFrom,
  setComponentHeight,
  setIsHeightReady,
  setVisualTheme,
  setGameDeck,
  deleteCardsFromDeck,
  toggleIsSingleCardMode,
  setFinishPoints,

  setLocalGame,

  clearLocalGames,
  updatePlayers,
  removeUserFromGame,
  setLocalGameStatus,
  updateLocalGame,
  setActiveScreen,
  removeActiveScreen,
  setIsShowMask,
  removeIsShowMask,
  updateVotesLocal,
  setSelectedCardId,
  removeSelectedCardId,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,

  setCardsSet,
  setLang,
  // toggleTheme,
  setTheme,
  setPageHeaderText,
  setPageHeaderTextSecond,
  setPageHeaderBgColor,
  addPreviewId,
  addPreloadUrl,
  setHasPreloaded,
  resetPreload,
  setTotalPreviews,
  setIsSetPassword,
  setUserActiveGameId,
  showNotification,
  hideNotification,

  clearLocalStateForLogout,
  clearLocalStateForGameDelete,
  clearLocalStateForNewRound,
} = localPersonalSlice.actions;
