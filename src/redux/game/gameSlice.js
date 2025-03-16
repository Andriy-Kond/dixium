import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const gameInitialState = {
  games: {
    // {
    //   gameName: String, // Game name
    //   gamePoster: String,
    //   gameStatus: String, // "lobby" | "makingTurn" | "voting" | "results" | "finished"
    //   isGameRunning: Boolean, // game started and running (players can't join anymore)
    //   isGameStarted: Boolean, // game started but not running (players can join)
    //   isSingleCardMode,
    //   hostPlayerId: String, // id творця гри
    //   hostPlayerName: String, // Ім'я творця гри
    //   storytellerId: String, // ID гравця, який зараз розповідає (той, хто робить перший хід)
    //   currentRound: Number, // 0
    //   cardsOnTable: [CardSchema], // Карти, які поклали на стіл під час голосування
    //   votes: { type: Map, of: { type: Map, of: String } },  Голоси гравців
    //          { playerId: {firstCard: firstCardId, second: secondCardId} }
    //   scores: { type: Map, of: Number }, // Бали гравців { playerId: score }
    //   players: [
    //     {
    //       _id: String,
    //       name: String,
    //       avatarURL: String,
    //       hand: [CardSchema],
    //       isGuessed: Boolean,
    //       isVoted: Boolean
    //     },
    //   ], // List of players
    //   deck: [CardSchema], // Deck of cards
    //   discardPile: [CardSchema],
    // },
  },

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

    setGameStatus: (state, action) => {
      const { gameId, status } = action.payload;
      const game = state.games[gameId];
      if (game) state.games[gameId].gameStatus = status;
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

    updateGame: (state, action) => {
      // If game arr is huge (100+ games) this option will be better, but it is mutate option:
      const updatedGame = action.payload;
      //# якщо games - це масив
      // const gameIndex = state.games.findIndex(g => g._id === updatedGame._id);

      //# якщо games - це об'єкт
      state.games[updatedGame._id] = updatedGame;

      // non mutation, but slower:
      // state.games = state.games.map(game =>
      //   game._id === action.payload._id ? action.payload : game,
      // );
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
  setGameStatus,

  clearGameInitialState,

  addGamesList,

  updateGame,

  setFirstStoryteller,
  nextStoryteller,
  setCardsOnTable,
} = gameSlice.actions;
