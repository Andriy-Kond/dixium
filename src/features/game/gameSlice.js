import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import socket from "socket.js";

const gameInitialState = {
  games: [
    //     {
    // _id: Schema.Types.ObjectId
    // gameName: String, // Game name
    // players: [
    //   {
    //     _id: String,
    //     name: String,
    //     avatarURL: String,
    //     hand: Array,
    //   },
    // ], // List of players
    // deck: [
    //   {
    //     cardName: String,
    //     public_id: String, // Public card id from Cloudinary
    //     url: String, // Card url from Cloudinary
    //     _id: Schema.Types.ObjectId, // Card id from MongoDB (like owner)
    //     isCardPlayed: Boolean,
    //   },
    // ], // Deck of cards
    // isGameRun: Boolean, // game started and running (players cannot join)
    // isGameStarted: Boolean, // game started but not running (players can join)
    // hostPlayerId: String,
    // hostPlayerName: String,
    // gameTitle: String,
    // }
  ],
  isCreatingGame: false,
  currentDeckId: null,
  currentGameId: null,
};

const shuffleDeck = deck => {
  return deck
    .map(card => ({ card, idx: Math.random() })) // Додати випадковий індекс
    .sort((a, b) => a.idx - b.idx) // Сортування за цим індексом
    .map(({ card }) => card); // Повертаю тільки карти
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

    setCurrentGameId: (state, action) => {
      state.currentGameId = action.payload;
    },

    // not good option, because will copy only higher level of object:
    // clearGameInitialState: () => {
    //   return { ...gameInitialState };
    // },
    // if gameInitialState will have nested structure, they will not be copied to state
    // better option:
    clearGameInitialState: () => gameInitialState,

    addGamesList: (state, action) => {
      state.games = action.payload;
    },

    // addGame: (state, action) => {
    //   state.games.push(action.payload);
    // },

    updateGame: (state, action) => {
      state.games = state.games.map(game =>
        game._id === action.payload._id ? action.payload : game,
      );
    },

    // removeGame: (state, action) => {
    //   state.games = state.games.filter(game => game._id !== action.payload);
    // },

    // addPlayerToGame: (state, action) => {
    //   const { gameId, player } = action.payload;
    //   const game = state.games.find(game => game._id === gameId);

    //   if (game) {
    //     game.players.push(player);
    //   }
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
  setCurrentGameId,

  clearGameInitialState,

  distributeCards,
  updateGamesCollectionInMongoDb,
  addGamesList,
  // addGame,
  // removeGame,
  updateGame,
  setCurrentGame,
  addPlayerToGame,
} = gameSlice.actions;
