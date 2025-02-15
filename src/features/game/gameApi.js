import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

const { REACT_APP_BASE_URL } = process.env;

const baseQuery = fetchBaseQuery({
  baseUrl: REACT_APP_BASE_URL,
  // For works by token:
  prepareHeaders: (headers, { getState }) => {
    const token = getState().authSlice.userToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery,

  endpoints: builder => ({
    getAllDecks: builder.query({
      query: () => `dixium/decks`, // Get available decks
      // providesTags: ["AllDecks"],
    }),

    getCurrentDeck: builder.query({
      query: deckId => `dixium/decks/${deckId}`, // Get cards in current deck
      // providesTags: ["Deck"],
    }),

    getAllGames: builder.query({
      query: () => `dixium/games`, // Get available games
      providesTags: ["AllGames"],
    }),

    removeGameByApi: builder.mutation({
      query: gameId => ({
        url: `dixium/games/${gameId}`,
        method: "DELETE", // add new game
        body: gameId,
      }),
      invalidatesTags: ["AllGames"],
    }),

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

  useGetAllGamesQuery,
  useRemoveGameByApiMutation,
  // useCreateGameMutation,
} = gameApi;
