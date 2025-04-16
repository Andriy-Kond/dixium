import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { LOBBY } from "utils/generals/constants.js";

const gameInitialState = {
  // games: {},
  activeGame: null, // Для варіанта з однією грою
  isCreatingGame: false,
  currentDeckId: null,
  activeActions: {},
};

export const gameSlice = createSlice({
  name: "gameSlice",
  initialState: gameInitialState,
  reducers: {
    setIsCreatingGame: (state, action) => {
      state.isCreatingGame = action.payload;
    },

    setCurrentDeckId: (state, action) => {
      state.currentDeckId = action.payload;
    },

    setActiveAction: (state, action) => {
      const { key, value } = action.payload;
      state.activeActions[key] = value;
    },

    clearActiveAction: (state, action) => {
      delete state.activeActions[action.payload];
    },

    setGameStatus: (state, action) => {
      const { status } = action.payload;
      const game = state.activeGame;
      if (!game) return;

      state.activeGame.gameStatus = status;
    },

    clearGameInitialState: () => gameInitialState, // todo додати виклик якщо поганий токен

    updateGame: (state, action) => {
      state.activeGame = action.payload;
    },

    setFirstStoryteller: (state, action) => {
      const { playerId } = action.payload;
      const game = state.activeGame;

      if (game && !game.storytellerId) {
        game.storytellerId = playerId;
      }
    },

    nextStoryteller: (state, action) => {
      const game = state.activeGame;
      if (!game) return;

      const currentIndex = game.players.findIndex(
        player => player._id === game.storytellerId,
      );
      const nextIndex = (currentIndex + 1) % game.players.length;
      game.storytellerId = game.players[nextIndex]._id;
    },

    setCardsOnTable: (state, action) => {
      const { card } = action.payload;
      const game = state.activeGame;
      if (!game) return;

      game.cardsOnTable.push(card);
    },

    updatePlayerVote: (state, action) => {
      const { playerId, firstVotedCardId, secondVotedCardId } = action.payload;
      const game = state.activeGame;
      if (!game) return;

      game.votes = {
        ...game.votes,
        [playerId]: {
          firstVotedCardId,
          secondVotedCardId,
        },
      };
    },

    updateCurrentPlayer: (state, action) => {
      const { player } = action.payload;
      const game = state.activeGame;
      if (!game) return;

      const idx = game.players.findIndex(p => p._id === player._id);
      if (idx !== -1) game.players[idx] = player;
      else game.players.push(player);
    },

    clearingForNewRound: (state, action) => {
      const game = state.activeGame;

      if (!game) return;
      game.votes = {};
      game.gameStatus = LOBBY;
      game.cardsOnTable = {};
      game.votes = {};
    },

    deleteGame: (state, action) => {
      state.activeGame = null;
    },

    // addGamesList: (state, action) => {
    //   state.games = action.payload;
    // },

    // updateGameInGames: (state, action) => {
    //   const updatedGame = action.payload;
    //   state.games[updatedGame._id] = updatedGame;
    // },
  },
});

const persistConfig = {
  key: "gameSlice",
  storage,
};

export const persistedGameReducer = persistReducer(
  persistConfig,
  gameSlice.reducer,
);

export const {
  setIsCreatingGame,
  setCurrentDeckId,
  setGameStatus,
  clearGameInitialState,
  updateGame,
  setActiveAction,
  clearActiveAction,
  setFirstStoryteller,
  nextStoryteller,
  setCardsOnTable,
  updatePlayerVote,
  updateCurrentPlayer,
  clearingForNewRound,
  deleteGame,
  // addGamesList,
  // updateGameInGames,
} = gameSlice.actions;
