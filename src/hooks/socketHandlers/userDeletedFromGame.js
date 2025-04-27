// import { authApi } from "redux/auth/authApi.js";
// import { setUserCredentials } from "redux/auth/authSlice.js";
import {
  setLocalGame,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";

export const userDeletedFromGame = ({
  game,
  deletedUser,
  userCredentials,
  dispatch,
  navigate,
}) => {
  console.log("userDeletedFromGame");

  if (!game) throw new Error(`The game is ${game}`);

  // deletedUser can be undefined if not found on server
  if (deletedUser?._id === userCredentials._id) {
    // Delete current user from game if it still in room
    dispatch(setLocalGame({}));
    dispatch(setUserActiveGameId(null));
    navigate("/game"); // можна перенаправити тут, а не у компоненті
  } else {
    dispatch(setLocalGame(game));
  }
};
