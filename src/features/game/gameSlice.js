import { createSlice } from "@reduxjs/toolkit";
import { players } from "resources/players";
import { deck } from "resources/decks";

const gameInitialState = {
  deck,
  players,
};

const shuffleDeck = deck => {
  return deck
    .map(card => ({ card, idx: Math.floor(Math.random() * 64) + 1 })) // Додати випадковий індекс
    .sort((a, b) => a.idx - b.idx) // Сортування за цим індексом
    .map(({ card }) => card); // Повертаю тільки карти
};

export const gameSlice = createSlice({
  name: "game",
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
  },
});
