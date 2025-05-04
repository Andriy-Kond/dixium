import {
  clearLocalGame,
  setLocalGame,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";

export const userDeletedFromGame = ({
  game,
  deletedUser,
  userId,
  dispatch,
  navigate,
}) => {
  console.log("userDeletedFromGame");

  if (!game) throw new Error(`The game is ${game}`);

  // deletedUser can be undefined if not found on server
  if (deletedUser && deletedUser._id === userId) {
    // Delete current user from game if it still in room
    navigate("/game");
    dispatch(setUserActiveGameId(null));
    dispatch(clearLocalGame(game));
  } else {
    dispatch(setLocalGame(game));
  }
};
