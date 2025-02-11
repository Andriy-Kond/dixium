import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logoutUser } from "features/auth/authSlice.js";

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

// Handling when the token is invalid or expired.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("❌ Токен недійсний або прострочений. Виконується вихід...");

    api.dispatch(logoutUser()); // clear auth state
  }

  return result;
};

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    signupUser: build.mutation({
      query: user => ({
        url: `/api/auth/register`,
        method: "POST",
        body: user,
      }),

      invalidatesTags: ["User"],
    }),

    loginUser: build.mutation({
      query: user => ({
        url: `/api/auth/login`,
        method: "POST",
        body: user,
      }),

      invalidatesTags: ["User"],
    }),

    logoutUser: build.mutation({
      query: () => ({
        url: `/api/auth/logout`,
        method: "POST",
      }),

      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,

      // invalidatesTags: ["User"],
      // Після виходу (UserMenu - handleLogout) я очищую стан за допомогою resetApiState(). Тому інвалідувати залежність тут не потрібно. Вона лише викликає додаткові запити на сервер після виходу. А вони не потрібні.
    }),

    getUserByToken: build.query({
      query: () => ({
        url: `/api/auth/current`,
      }),

      providesTags: ["User"],
    }),

    uploadAvatar: build.mutation({
      query: () => ({
        url: `/api/auth/avatars`,
        method: "PATCH",
      }),

      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSignupUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserByTokenQuery,
  useUploadAvatarMutation,
} = usersApi;
