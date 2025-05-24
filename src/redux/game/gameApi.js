import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

const { REACT_APP_BASE_URL, REACT_APP_BASE_URL_DEPLOY } = process.env;

const baseQuery = fetchBaseQuery({
  baseUrl: REACT_APP_BASE_URL_DEPLOY,
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
