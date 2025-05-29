import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

const {
  REACT_APP_BASE_URL, // DEV: http://localhost:3001, DEPLOY: https://dixium-backend-mongo-cloudinary.onrender.com
} = process.env;

const baseQuery = fetchBaseQuery({
  baseUrl: REACT_APP_BASE_URL,
  // For works by token:
  prepareHeaders: (headers, { getState }) => {
    const token = getState().authSlice.user.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery,
  // keepUnusedDataFor: 5, // видаляє очікування 60 сек перед очищенням кешу
  tagTypes: ["AllGames", "CurrentGame", "Game", "AllDecks", "Deck"],
  endpoints: builder => ({
    getAllDecks: builder.query({
      query: () => `dixium/decks`, // Get available decks
      providesTags: ["AllDecks"],
    }),

    getCurrentDeck: builder.query({
      query: deckId => `dixium/decks/${deckId}`, // Get cards in current deck
      providesTags: ["Deck"],
    }),

    getCurrentGame: builder.query({
      query: gameId => `dixium/games/${gameId}`, // Get current game
      // providesTags: ["Game"],
      // providesTags: (result, error, gameId) => [{ type: "Game", id: gameId }],
      providesTags: (result, error, gameId) =>
        result ? [{ type: "Game", id: gameId }] : ["Game"],
    }),

    findGame: builder.query({
      query: playerGameId => `dixium/games/find/${playerGameId}`, // Get current game
      // providesTags: ["Game"],
      providesTags: (result, error, playerGameId) => [
        { type: "Game", id: playerGameId },
      ],
    }),
  }),
});

export const {
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,

  // useGetAllGamesQuery,
  useGetCurrentGameQuery,
  useFindGameQuery,
  useUpdateCurrentGameMutation,
} = gameApi;

// Інвалідувати кеш для гри
// dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));

// dispatch(gameApi.util.resetApiState());

// dispatch(authApi.util.invalidateTags(["User"])); // update authApi
// dispatch(gameApi.util.invalidateTags([{ type: "Game", id: gameId }]));
// dispatch(gameApi.util.invalidateTags(["Game"]));
// dispatch(gameApi.util.getCurrentGame(gameId));

// dispatch(
//   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
//     // Якщо гра вже є, оновлюємо її
//     if (game._id in draft) {
//       const currentGame = draft[game._id];

//       if (currentGame) {
//         draft[game._id].isGameStarted = game.isGameStarted;

//         const playerIdx = currentGame.players.findIndex(
//           p => p._id === player._id,
//         );

//         if (playerIdx !== -1) {
//           currentGame.players[playerIdx] = player;
//           // оновлення кешу gameApi Redux
//           // dispatch(updateCurrentPlayer({ gameId: game._id, player })); // оновлення gameSlice
//         } else {
//           currentGame.players.push(player);
//         }
//         dispatch(updateCurrentPlayer({ gameId: game._id, player })); // оновлення gameSlice
//       }
//     } else {
// console.log(`Game ${game._id} not found`);
//       Notify.failure(`Game with ID ${game._id} not found`);
//     }
//   }),
// );

// dispatch(
//   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
//     if (game._id in draft) {
//       // Якщо гра вже є, оновлюємо її
//       dispatch(updateLocalGame(game)); // оновлення gameSlice (для актуального локального стейту)
//       draft[game._id] = game; // оновлення кешу gameApi (для рендерингу переліку ігор)

//       dispatch(
//         setActiveScreen({
//           gameId: game._id,
//           playerId: playerId,
//           screen: 0,
//         }),
//       );
//     }
//   }),
// );
