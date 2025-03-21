import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const gameInitialState = {
  games: {
    // {
    //   _id: String,
    //   gameName: String, // Game name
    //   gamePoster: String,
    //   gameStatus: String, // "lobby" | "makingMove" | "voting" | "results" | "finished"
    //   isGameRunning: Boolean, // game started and running (players can't join anymore)
    //   isGameStarted: Boolean, // game started but not running (players can join)
    //   isFirstTurn: Boolean,
    //   isSingleCardMode: Boolean,
    //   hostPlayerId: String, // id творця гри
    //   hostPlayerName: String, // Ім'я творця гри
    //   storytellerId: String, // ID гравця, який зараз розповідає (той, хто робить перший хід)
    //   currentRound: Number, // 0
    //   cardsOnTable: [{
    //       _id: String,
    //       cardName: String,
    //       public_id: String, // Public card id from Cloudinary
    //       url: String, // Card url from Cloudinary
    //       owner: String,
    //     }, ], // Карти, які поклали на стіл під час голосування
    //   votes:  { playerId: {firstVotedCardId, secondVotedCardId }, }, // Голоси гравців
    //   scores: { playerId: score, }, // Бали гравців { playerId: score }
    //   players: [ {
    //       _id: String,
    //       name: String,
    //       avatarURL: String,
    //       hand: [{}],
    //       isGuessed: Boolean,
    //       isVoted: Boolean,
    //     }, ], // List of players
    //   deck: [CardSchema],
    //   // Deck of cards
    //   discardPile: [{}],
    //   roundResults: [ {
    //       _id: String,
    //       cardName: String,
    //       public_id: String,
    //       url: String,
    //       owner: String,
    //       votesForThisCard: [ {
    //           playerName: String,
    //           voteCount: Number,
    //        }, ],
    //     },
    //   ],
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

      // non mutation, but slower:
      // state.games = state.games.map(game =>
      //   game._id === action.payload._id ? action.payload : game,
      // );

      //# якщо games - це об'єкт
      state.games[updatedGame._id] = updatedGame;
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

    updatePlayerVoteLocally: (state, action) => {
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
  updatePlayerVoteLocally,
  updateCurrentPlayer,
} = gameSlice.actions;

// } else if (
//   !storytellerId ||
//   isCurrentPlayerStoryteller ||
//   isCurrentPlayerVoted
// ) {
//   setMiddleButton(null);
// } else {
//   const playerVotes = votes[userCredentials._id] || {};
//   const isCanVote =
//     playersMoreThanThree && isSingleCardMode
//       ? !!playerVotes.firstVotedCardId
//       : !!playerVotes.firstVotedCardId && !!playerVotes.secondVotedCardId;

//   if (isCanVote) {
//     setMiddleButton(
//       <Button
//         btnStyle={["btnFlexGrow"]}
//         btnText={"Vote card"}
//         onClick={handleVote}
//         disabled={gameStatus === VOTING && (!isCanVote || isCurrentPlayerVoted)}
//       />
//     );
//   } else {
//     setMiddleButton(null);
//   }
// }
