import { authApi } from "redux/auth/authApi.js";
import { setUserCredentials } from "redux/auth/authSlice.js";

export const updateUserCredentials = (user, dispatch) => {
  console.log("updateUserCredentials");

  if (!user) {
    throw new Error(`The user is ${user}`);
  }

  dispatch(setUserCredentials(user));

  dispatch(authApi.util.invalidateTags(["User"]));
  console.log(" updateUserCredentials >> user:::", user);
};
