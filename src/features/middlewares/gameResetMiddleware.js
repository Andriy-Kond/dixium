// Clear gameSlice state when token is not valid or user was deleted from db
// You must add this middleware to app/store.js
// Otherwise need to use api.dispatch(clearGameInitialState()); in usersApi.js

// or You can modify logoutUser in authSlice.js:
// logoutUser: state => {
//   state.userToken = null;
//   state.isLoggedIn = false;
//   state.user = {};
//   // Clear gameSlice:
//   localStorage.removeItem("persist:gameSlice"); // Видаляємо дані з persist
//   return { ...state, gameSlice: gameInitialState }; // Скидаємо стан гри
// },

import { logoutUser } from "features/auth/authSlice.js";
import { clearGameInitialState } from "../game/gameSlice.js";

export const gameResetMiddleware = store => next => action => {
  if (action.type === logoutUser.type) {
    store.dispatch(clearGameInitialState());
  }
  return next(action);
};
