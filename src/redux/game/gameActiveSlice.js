import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { LOBBY } from "utils/generals/constants.js";

const gameInitialState = {
  isCreatingGame: false,
  currentDeckId: null,

  activeActions: {},

  // Для варіанта з пошуком по номеру гри
  activeGame: null,
};

export const gameActiveSlice = createSlice({
  name: "gameActiveSlice",
  initialState: gameInitialState,
  reducers: {
    setIsCreatingGame: (state, action) => {
      state.isCreatingGame = action.payload;
    },

    setCurrentDeckId: (state, action) => {
      state.currentDeckId = action.payload;
    },

    setGameStatus: (state, action) => {
      const { gameId, status } = action.payload;
      const game = state.games[gameId];
      if (game) state.games[gameId].gameStatus = status;
    },

    setActiveGameStatus: (state, action) => {
      const { status } = action.payload;
      if (state.activeGame) state.activeGame.gameStatus = status;
    },

    // not good option, because will copy only higher level of object:
    // clearGameInitialState: () => {
    //   return { ...gameInitialState };
    // },
    // if gameInitialState will have nested structure, they will not be copied to state
    // better option:
    clearGameInitialState: () => gameInitialState, // todo додати виклик якщо поганий токен

    addGamesList: (state, action) => {
      state.games = action.payload;
    },

    updateGame: (state, action) => {
      // If game arr is huge (100+ games) this option will be better, but it is mutate option:
      const updatedGame = action.payload;
      //# якщо games - це масив
      // const gameIndex = state.games.findIndex(g => g._id === updatedGame._id);

      // non mutation, but slower:
      // state.games = state.games.map(game =>
      //   game._id === action.payload._id ? action.payload : game,
      // );

      //# якщо games - це об'єкт
      state.games[updatedGame._id] = updatedGame;
    },

    updateActiveGame: (state, action) => {
      state.activeGame = action.payload;
    },

    setActiveAction(state, action) {
      const { key, value } = action.payload;
      state.activeActions[key] = value;
    },

    clearActiveAction(state, action) {
      delete state.activeActions[action.payload];
    },

    setFirstStoryteller: (state, action) => {
      const { gameId, playerId } = action.payload;

      //# якщо games - це об'єкт:
      const game = state.games[gameId];
      //# якщо games - це масив:
      // const game = state.games.find(game => game._id === gameId);

      if (game && !game.storytellerId) {
        game.storytellerId = playerId;
      }
    },

    nextStoryteller: (state, action) => {
      const { gameId } = action.payload;

      //# якщо games - це об'єкт:
      const game = state.games[gameId];
      //# якщо games - це масив:
      // const game = state.games.find(game => game._id === gameId);

      if (game) {
        const currentIndex = game.players.findIndex(
          player => player._id === game.storytellerId,
        );
        const nextIndex = (currentIndex + 1) % game.players.length;
        game.storytellerId = game.players[nextIndex]._id;
      }
    },

    setCardsOnTable(state, action) {
      const { gameId, card } = action.payload;
      const game = state.games[gameId];
      if (game) state.games[gameId].cardsOnTable.push(card);
    },

    updatePlayerVote: (state, action) => {
      const { gameId, playerId, firstVotedCardId, secondVotedCardId } =
        action.payload;
      const game = state.games[gameId];
      if (game) {
        state.games[gameId].votes = {
          ...game.votes,
          [playerId]: {
            firstVotedCardId,
            secondVotedCardId,
          },
        };
      }
    },

    updateCurrentPlayer(state, action) {
      const { gameId, player } = action.payload;
      const game = state.games[gameId];
      if (game) {
        const idx = game.players.findIndex(p => p._id === player._id);
        if (idx !== -1) game.players[idx] = player;
        else game.players.push(player);
      }
    },

    clearingForNewRound: (state, action) => {
      const { gameId } = action.payload;
      const game = state.games[gameId];

      if (!game) return;
      game.votes = {};
      game.gameStatus = LOBBY;
      game.cardsOnTable = {};
      game.votes = {};
    },

    deleteActiveGame: (state, action) => {
      state.activeGame = null;
    },
  },
});

const persistConfig = {
  key: "gameActiveSlice",
  storage,
};

export const persistedGameActiveReducer = persistReducer(
  persistConfig,
  gameActiveSlice.reducer,
);

export const {
  setActiveAction,
  clearActiveAction,
  setIsCreatingGame,
  setCurrentDeckId,
  setGameStatus,
  setActiveGameStatus,

  clearGameInitialState,

  addGamesList,

  updateGame,
  updateActiveGame,

  setFirstStoryteller,
  nextStoryteller,
  setCardsOnTable,
  updatePlayerVote,
  updateCurrentPlayer,
  clearingForNewRound,

  deleteActiveGame,
} = gameActiveSlice.actions;
