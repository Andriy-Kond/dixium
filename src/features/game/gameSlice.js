import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const gameInitialState = {
  deck: [],
  players: [],
  isCreatingGame: false,
  gameDeckId: null,
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
    distributeCards: (state, action) => {
      const { cardsPerPlayer } = action.payload;
      const shuffledDeck = shuffleDeck([...state.deck]);

      state.players.map(player => {
        return (player.hand = shuffledDeck.splice(0, cardsPerPlayer));
      });

      state.deck = shuffledDeck; // Оновлюємо колоду після роздачі
    },

    setIsCreatingGame: (state, action) => {
      state.isCreatingGame = action.payload;
    },

    getDeck: (state, action) => {
      state.deck = action.payload;
    },

    setCurrentDeckId: (state, action) => {
      state.gameDeckId = action.payload;
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

export const { distributeCards, setIsCreatingGame, getDeck, setCurrentDeckId } =
  gameSlice.actions;
