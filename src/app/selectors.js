import { createSelector } from "@reduxjs/toolkit";
import { tasksApi } from "features/tasks/tasksSlice";
import { statusFilters } from "features/filters/constants";

export const selectFilters = state => state.filters.status;
export const selectUserIsLoggedIn = state => state.auth.isLoggedIn;
export const selectUserName = state => state.auth.user.name;
export const selectUserToken = state => state.auth.userToken;

// НЕ мемоїзований селектор
// export const selectTasksCount = state => {
//   const { items } = selectTasks(state);

//   console.log("Calculating task count"); // ця функція буде спрацьовувати навіть при зміні фільтру. Повідомлення в консолі каже про необхідність мемоїзації.
//   const tasksCount = items.reduce(
//     (acc, item) => {
//       item.completed ? (acc.completed += 1) : (acc.active += 1);
//       return acc;
//     },
//     { active: 0, completed: 0 },
//   );

//   return tasksCount;
// };

// const { data, error, isLoading } = pokemonApi.endpoints.getPokemonByName.useQuery('bulbasaur') // - робить запит на відповідну частину слайсу
// [tasksApi.endpoints.fetchTasks.select()], // - обирає відповідну частину стора
// Мемоїзований селектор
export const selectTasksCountMemo = createSelector(
  [tasksApi.endpoints.fetchTasks.select()], // обирає відповідну частину стора
  tasksResult => {
    console.log("Calculating task count");
    const tasks = tasksResult?.data || []; // без цієї перевірки дає помилку

    return tasks.reduce(
      (acc, task) => {
        task.completed ? (acc.completed += 1) : (acc.active += 1);
        return acc;
      },
      { active: 0, completed: 0 },
    );
  },
);

// НЕ мемоїзований селектор
// export const selectVisibleTasks = state => {
//   const { items } = selectTasks(state);
//   const filter = selectFilters(state);

//   console.log("Calculating visible tasks");

//   switch (filter) {
//     case statusFilters.active:
//       return items.filter(item => !item.completed);
//     case statusFilters.completed:
//       return items.filter(item => item.completed);
//     default:
//       return items;
//   }
// };

// Мемоїзований селектор
export const selectVisibleTasksMemo = createSelector(
  [tasksApi.endpoints.fetchTasks.select(), selectFilters], // обирає відповідну частину стора
  (tasksResult, filter) => {
    // console.log("Calculating visible tasks");
    const tasks = tasksResult?.data || []; // без цієї перевірки дає помилку

    switch (filter) {
      case statusFilters.active:
        return tasks.filter(item => !item.completed);
      case statusFilters.completed:
        return tasks.filter(item => item.completed);
      default:
        return tasks;
    }
  },
);
