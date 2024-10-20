import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://dixium.com/api/v1", // поки так для прикладу

  // Для майбутньої роботи по токену:
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userToken;

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
    getAllPlayers: builder.query({
      query: () => `/players`, // отримати масив гравців
      providesTags: ["Players"],
    }),

    getDeck: builder.query({
      query: () => `/deck`, // отримати масив карт
      providesTags: ["Deck"],
    }),

    dealCards: builder.mutation({
      query: () => ({
        url: `game/deal`,
        method: "POST", // Перша роздача карт (по 6шт, сервер виконує логіку)
      }),
    }),

    nextTurn: builder.mutation({
      query: () => ({
        url: `game/next-turn`,
        method: "POST", // Наступний хід (гравці скидають карту і беруть нову)
      }),
    }),
  }),
});

export const {
  useGetAllPlayersQuery,
  useGetDeckQuery,
  useDealCardsMutation,
  useNextTurnMutation,
} = gameApi;
