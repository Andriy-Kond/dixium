import { authApi } from "redux/auth/authApi.js";
import { setUserCredentials } from "redux/auth/authSlice.js";

export const updateUserCredentials = (user, userCredentials, dispatch) => {
  console.log("updateUserCredentials");
  console.log(" updateUserCredentials >> user:::", user);

  if (!user) {
    throw new Error(`The user is ${user}`);
  }

  const newUserCredentials = { ...userCredentials, ...user };

  dispatch(setUserCredentials(newUserCredentials));
  dispatch(authApi.util.invalidateTags(["User"]));
};
