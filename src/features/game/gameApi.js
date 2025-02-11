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

    createGame: builder.mutation({
      query: game => ({
        url: `dixium/games`, // Get cards in current deck
        method: "POST",
        body: game,
        // invalidatesTags: ["Games"],
      }),
    }),
  }),
});

export const {
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,
  useCreateGameMutation,
} = gameApi;
