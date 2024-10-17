import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://66f3151c71c84d805877c872.mockapi.io",
  }),

  endpoints: build => ({
    getAllTasks: build.query({
      query: () => `/tasks`,
      // transformResponse: response => response.data,
      // transformErrorResponse: response => response.status,
      providesTags: ["Tasks"],
      // або так (згідно документації):
      // providesTags: () => [{ type: "Tasks" }],
    }),

    fetchTaskById: build.query({
      query: id => `/tasks/${id}`,
      providesTags: ["Tasks"],
    }),

    addTask: build.mutation({
      query: task => ({
        url: `/tasks`,
        method: "POST",
        body: task,
      }),

      invalidatesTags: ["Tasks"],
    }),

    deleteTask: build.mutation({
      query: id => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Tasks"],
    }),

    editTask: build.mutation({
      query: task => ({
        url: `/tasks/${task.id}`,
        method: "PUT",
        body: task,
      }),

      invalidatesTags: ["Tasks"],
    }),

    toggleCompleted: build.mutation({
      query: task => ({
        url: `/tasks/${task.id}`,
        method: "PUT",
        body: { ...task, completed: !task.completed },
      }),

      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetAllTasksQuery,

  useFetchTaskByIdQuery,
  useAddTaskMutation,
  useDeleteTaskMutation,
  useEditTaskMutation,
  useToggleCompletedMutation,
} = tasksApi;
