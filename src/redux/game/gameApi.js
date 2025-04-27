import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

const { REACT_APP_BASE_URL } = process.env;

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
  tagTypes: ["AllGames", "CurrentGame", "Game"],
  endpoints: builder => ({
    getAllDecks: builder.query({
      query: () => `dixium/decks`, // Get available decks
      // providesTags: ["AllDecks"],
    }),

    getCurrentDeck: builder.query({
      query: deckId => `dixium/decks/${deckId}`, // Get cards in current deck
      // providesTags: ["Deck"],
    }),

    // getAllGames: builder.query({
    //   query: () => `dixium/games`, // Get available games
    //   providesTags: ["AllGames"],
    // }),

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

    // updateCurrentGame: builder.mutation({
    //   query: ({ gameId, data }) => ({
    //     url: `dixium/games/${gameId}`,
    //     method: "PATCH",
    //     body: data,
    //   }),

    //   // Після оновлення, всі ігри будуть оновлені
    //   // invalidatesTags: ["AllGames"],

    //   // Оновити конкретну гру, а не всі ігри:
    //   invalidatesTags: (result, error, { gameId }) => [
    //     { type: "Game", id: gameId }, // Оновлюється конкретна гра
    //     // { type: "AllGames" }, // Оновлюється всі ігри
    //   ],
    // }),

    // removeGameFromServer: builder.mutation({
    //   query: gameId => ({
    //     url: `dixium/games/${gameId}`,
    //     method: "DELETE", // add new game
    //     body: gameId,
    //   }),
    //   invalidatesTags: ["AllGames"],
    // }),

    // createGame: builder.mutation({
    //   query: game => ({
    //     url: `dixium/games`,
    //     method: "POST", // add new game
    //     body: game,
    //   }),
    //   invalidatesTags: ["AllGames"],
    // }),
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
