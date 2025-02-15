import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const gameInitialState = {
  games: [],
  currentGame: null,
  deck: [],
  players: [
    // {
    //   name: "",
    //   hostPlayer: false,
    //   avatar: "",
    // },
  ],
  isCreatingGame: false,
  startGame: false,
  isGameStarted: false,
  gameDeckId: null,
  gameId: null,
};

const shuffleDeck = deck => {
  return deck
    .map(card => ({ card, idx: Math.floor(Math.random() * 64) + 1 })) // Додати випадковий індекс
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

    getDeck: (state, action) => {
      state.deck = action.payload;
    },

    setCurrentDeckId: (state, action) => {
      state.gameDeckId = action.payload;
    },

    addPlayer: (state, action) => {
      state.players.push(action.payload);
    },

    clearGameInitialState: () => gameInitialState,
    // not good option, because will copy only higher level of object:
    // clearGameInitialState: () => {
    //   return { ...gameInitialState };
    // },
    // if gameInitialState will have nested structure, they will not be copied to state

    distributeCards: (state, action) => {
      const { cardsPerPlayer } = action.payload;
      const shuffledDeck = shuffleDeck([...state.deck]);

      state.players.map(player => {
        return (player.hand = shuffledDeck.splice(0, cardsPerPlayer));
      });

      state.deck = shuffledDeck; // Оновлюємо колоду після роздачі
    },

    setGames: (state, action) => {
      state.games = action.payload;
    },
    addGame: (state, action) => {
      state.games = [...state.games, action.payload];
    },
    updateGame: (state, action) => {
      state.games = state.games.map(game =>
        game._id === action.payload._id ? action.payload : game,
      );
    },
    setCurrentGame: (state, action) => {
      state.currentGame = action.payload;
    },
    addPlayerToGame: (state, action) => {
      const { gameId, player } = action.payload;
      const game = state.games.find(g => g._id === gameId);
      if (game) {
        game.players.push(player);
      }
    },
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
  getDeck,
  setCurrentDeckId,
  addPlayer,
  clearGameInitialState,

  distributeCards,

  setGames,
  addGame,
  updateGame,
  setCurrentGame,
  addPlayerToGame,
} = gameSlice.actions;
