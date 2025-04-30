import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logoutUser } from "redux/auth/authSlice.js";
import { gameApi } from "redux/game/gameApi.js";

const { REACT_APP_BASE_URL } = process.env;

const baseQuery = fetchBaseQuery({
  baseUrl: REACT_APP_BASE_URL,
  // For works by token:
  prepareHeaders: (headers, { getState }) => {
    const token = getState().authSlice.user.token;
    if (token) headers.set("authorization", `Bearer ${token}`);

    return headers;
  },

  // логування для дебагінгу
  // fetchFn: async (...args) => {
  //   console.log("RTK Query request:", args);
  //   return fetch(...args);
  // },
});

// Handling when the token is invalid or expired.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      console.log("❌ Токен недійсний або прострочений. Виконується вихід...");
      api.dispatch(logoutUser()); // clear auth state
    } else {
      console.error("Помилка запиту:", result.error);
    }
  }

  return result;
};

// providesTags: Вказує, які теги (або "кеші") надає певний запит (query). Це дозволяє RTK Query знати, які дані кешуються для цього запиту.
// invalidateTags: Вказує, які теги потрібно інвалідувати (очистити кеш) після виконання мутації. Це змушує запити, які надають ці теги, повторно виконатися для оновлення даних.

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  // keepUnusedDataFor: 0, // видаляє очікування 60 сек перед очищенням кешу
  endpoints: build => ({
    signupUser: build.mutation({
      query: userCredentials => ({
        url: `/api/auth/register`,
        method: "POST",
        body: userCredentials,
      }),

      providesTags: ["User"], // бо повертає дані користувача, які можуть бути використані в кеші
      invalidatesTags: ["User"],
    }),

    loginUser: build.mutation({
      query: userCredentials => ({
        url: `/api/auth/login`,
        method: "POST",
        body: userCredentials,
      }),

      providesTags: ["User"], // бо повертає дані користувача, які можуть бути використані в кеші
      invalidatesTags: ["User"],
    }),

    googleLogin: build.mutation({
      query: token => ({
        url: `/api/auth/google`,
        method: "POST",
        body: { token },
      }),
      providesTags: ["User"], // бо повертає дані користувача, які можуть бути використані в кеші
      invalidatesTags: ["User"],
    }),

    getUserByToken: build.query({
      query: () => ({
        url: `/api/auth/current`,
      }),

      // providesTags: ["User"],
      providesTags: () => {
        // console.log("Providing User tag"); // для дебагингу
        return ["User"];
      },
    }),

    setPassword: build.mutation({
      query: ({ password }) => ({
        url: "/api/auth/set-nickname",
        method: "POST",
        body: { password },
      }),

      invalidatesTags: ["User"], // Оновити кеш даних користувача
    }),

    forgotPassword: build.mutation({
      query: ({ email }) => ({
        url: `/api/auth/forgot-password`,
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: build.mutation({
      query: ({ resetToken, password }) => ({
        url: `/api/auth/reset-password/${resetToken}`,
        method: "POST",
        body: { password },
      }),
    }),

    logoutUser: build.mutation({
      query: () => ({
        url: `/api/auth/logout`,
        method: "POST",
      }),

      // refetchOnReconnect: true,
      // refetchOnMountOrArgChange: true,
      // refetchOnMountOrArgChange: false, // не робити новий запит при кожному монтуванні компонента, якщо дані вже є в кеші.

      // invalidatesTags: ["User"],
      // Після виходу (UserMenu - handleLogout) я очищую стан за допомогою resetApiState(). Тому інвалідувати залежність тут не потрібно. Вона лише викликає додаткові запити на сервер після виходу. А вони не потрібні.

      async queryFulfilled({ dispatch, queryFulfilled }) {
        await queryFulfilled; // чекати завершення виконання мутації
        // dispatch(authApi.util.invalidateTags([])); // Інвалідовує всі теги
        // dispatch(authApi.util.unsubscribeQueries([])); // Відписка від запитів
        dispatch(authApi.util.resetApiState());
        dispatch(gameApi.util.resetApiState());
      },
    }),

    resendVerificationEmail: build.mutation({
      query: () => ({
        url: "/api/auth/resend-verification",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    uploadAvatar: build.mutation({
      query: () => ({
        url: `/api/auth/avatars`,
        method: "PATCH",
      }),

      invalidatesTags: ["User"],
    }),

    setNickname: build.mutation({
      query: ({ nickname }) => ({
        url: "/api/auth/set-password",
        method: "POST",
        body: { nickname },
      }),

      invalidatesTags: ["User"], // Оновити кеш даних користувача
    }),
  }),
});

export const {
  useSignupUserMutation,
  useLoginUserMutation,
  useGoogleLoginMutation,
  useLogoutUserMutation,
  useGetUserByTokenQuery,
  useUploadAvatarMutation,
  useSetPasswordMutation,
  useResendVerificationEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSetNicknameMutation,
} = authApi;
