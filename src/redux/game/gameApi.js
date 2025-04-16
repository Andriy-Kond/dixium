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
  // keepUnusedDataFor: 5, // видаляє очікування 60 сек перед очищенням кешу
  tagTypes: ["Game", "Deck", "Decks"],
  endpoints: builder => ({
    getAllDecks: builder.query({
      query: () => `dixium/decks`,
      providesTags: result =>
        // result — це результат запиту, який повертається з API після виконання query: () => dixium/decks. Тобто відповідь від сервера - масив об'єктів (колод), де кожен об'єкт має поле _id
        // result = [
        //   { _id: "1", name: "Колода 1", cards: [...] },
        //   { _id: "2", name: "Колода 2", cards: [...] },
        //   ...
        // ];
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Deck", id: _id })), // створює тег для кожної колоди ({ type: "Deck", id: _id }).
              { type: "Decks", id: "LIST" }, // позначає кеш списку всіх колод.
            ]
          : [{ type: "Decks", id: "LIST" }], // для інвалідації всієї колоди (якщо буде мутація колоди у майбутньому коді)
    }),

    getCurrentDeck: builder.query({
      query: deckId => `dixium/decks/${deckId}`, // Get cards in current deck
      providesTags: (result, error, deckId) => [{ type: "Deck", id: deckId }],
    }),

    getCurrentGame: builder.query({
      query: gameId => `dixium/games/${gameId}`, // Get current game
      // providesTags: ["Game"],
      providesTags: (result, error, gameId) => [{ type: "Game", id: gameId }],
    }),

    // getAllGames: builder.query({
    //   query: () => `dixium/games`, // Get available games
    //   providesTags: ["AllGames"],
    // }),

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

    // createGame: builder.mutation({
    //   query: game => ({
    //     url: `dixium/games`,
    //     method: "POST", // add new game
    //     body: game,
    //   }),
    //   invalidatesTags: ["AllGames"],
    // }),

    // deleteGame: builder.mutation({
    //   query: gameId => ({
    //     url: `dixium/games/${gameId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: (result, error, gameId) => [
    //     { type: "Game", id: gameId },
    //     "AllGames",
    //   ],
    // }),
  }),
});

export const {
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,
  useGetCurrentGameQuery,

  // useGetAllGamesQuery,
  // useUpdateCurrentGameMutation,
} = gameApi;
