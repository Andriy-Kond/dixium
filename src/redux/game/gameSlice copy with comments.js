import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
// import { LOBBY } from "utils/generals/constants.js";

const gameInitialState = {
  isCreatingGame: false,
  currentDeckId: null,
  activeActions: {},
  // Для варіанта з пошуком по номеру гри
  // activeGame: null,
  games: {},
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

    // setGameStatus: (state, action) => {
    //   const { gameId, status } = action.payload;
    //   const game = state.games[gameId];
    //   if (game) state.games[gameId].gameStatus = status;
    // },

    // not good option, because will copy only higher level of object:
    // clearGameInitialState: () => {
    //   return { ...gameInitialState };
    // },
    // if gameInitialState will have nested structure, they will not be copied to state
    // better option:
    clearGameInitialState: () => gameInitialState,

    // addGamesList: (state, action) => {
    //   state.games = action.payload;
    // },

    // updateGame: (state, action) => {
    //   const updatedGame = action.payload;
    //   state.games[updatedGame._id] = updatedGame;
    // },

    setActiveAction(state, action) {
      const { key, value } = action.payload;
      state.activeActions[key] = value;
    },

    clearActiveAction(state, action) {
      delete state.activeActions[action.payload];
    },

    // setFirstStoryteller: (state, action) => {
    //   const { gameId, playerId } = action.payload;
    //   //# якщо games - це об'єкт:
    //   const game = state.games[gameId];
    //   //# якщо games - це масив:
    //   // const game = state.games.find(game => game._id === gameId);
    //   if (game && !game.storytellerId) {
    //     game.storytellerId = playerId;
    //   }
    // },

    // nextStoryteller: (state, action) => {
    //   const { gameId } = action.payload;
    //   //# якщо games - це об'єкт:
    //   const game = state.games[gameId];
    //   //# якщо games - це масив:
    //   // const game = state.games.find(game => game._id === gameId);
    //   if (game) {
    //     const currentIndex = game.players.findIndex(
    //       player => player._id === game.storytellerId,
    //     );
    //     const nextIndex = (currentIndex + 1) % game.players.length;
    //     game.storytellerId = game.players[nextIndex]._id;
    //   }
    // },

    // setCardsOnTable(state, action) {
    //   const { gameId, card } = action.payload;
    //   const game = state.games[gameId];
    //   if (game) state.games[gameId].cardsOnTable.push(card);
    // },

    // updatePlayerVote: (state, action) => {
    //   const { gameId, playerId, firstVotedCardId, secondVotedCardId } =
    //     action.payload;
    //   const game = state.games[gameId];
    //   if (game) {
    //     state.games[gameId].votes = {
    //       ...game.votes,
    //       [playerId]: {
    //         firstVotedCardId,
    //         secondVotedCardId,
    //       },
    //     };
    //   }
    // },

    // updateCurrentPlayer(state, action) {
    //   const { gameId, player } = action.payload;
    //   const game = state.games[gameId];
    //   if (game) {
    //     const idx = game.players.findIndex(p => p._id === player._id);
    //     if (idx !== -1) game.players[idx] = player;
    //     else game.players.push(player);
    //   }
    // },

    // clearingForNewRound: (state, action) => {
    //   const { gameId } = action.payload;
    //   const game = state.games[gameId];

    //   if (!game) return;
    //   game.votes = {};
    //   game.gameStatus = LOBBY;
    //   game.cardsOnTable = {};
    //   game.votes = {};
    // },

    // // Для варіанта з пошуком по номеру гри
    // setActiveGame: (state, action) => {
    //   state.activeGame = action.payload;
    // },
    // deleteActiveGame: (state, action) => {
    //   state.activeGame = null;
    // },
    // updateActiveGame: (state, action) => {
    //   state.activeGame = action.payload;
    // },

    // setFoundGame: (state, action) => {
    //   const game = action.payload;

    //   state.games = { [game._id]: game };
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
  setActiveAction,
  clearActiveAction,
  setIsCreatingGame,
  setCurrentDeckId,
  // setGameStatus,
  clearGameInitialState,
  // addGamesList,
  // updateGame,
  // setFirstStoryteller,
  // nextStoryteller,
  // setCardsOnTable,
  // updatePlayerVote,
  // updateCurrentPlayer,
  // clearingForNewRound,
  setActiveGame,
  deleteActiveGame,
  updateActiveGame,
  // setFoundGame,
} = gameSlice.actions;
