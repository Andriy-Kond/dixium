// import { authApi } from "redux/auth/authApi.js";
// import { setUserActiveGameId } from "redux/game/localPersonalSlice.js";
import { setUserCredentials } from "redux/auth/authSlice.js";

export const updateUserCredentials = (user, dispatch) => {
  console.log("updateUserCredentials");

  if (!user) throw new Error(`The user is ${user}`);

  // Оновити лише якщо є відповідні поля
  const { userActiveGameId, ...credentials } = user;
  if (Object.keys(credentials).length > 0) {
    dispatch(setUserCredentials(credentials));
  }
};

// import { authApi } from "redux/auth/authApi.js";
// import { setUserActiveGameId } from "redux/game/localPersonalSlice.js";
// import { setUserCredentials } from "redux/auth/authSlice.js";

// export const updateUserCredentials = (user, userCredentials, dispatch) => {
//   console.log("updateUserCredentials");

//   if (!user) throw new Error(`The user is ${user}`);

//   const newUserCredentials = { ...userCredentials, ...user };

//   dispatch(setUserCredentials(...newUserCredentials));
//   dispatch(newUserCredentials.userActiveGameId);
// };
// // dispatch(authApi.util.invalidateTags(["User"]));
