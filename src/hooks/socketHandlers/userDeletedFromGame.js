import { gameApi } from "redux/game/gameApi.js";
import {
  clearLocalStateForGameDelete,
  removeUserFromGame,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";
import socket from "services/socket.js";

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

    console.log("це юзер якого видалили");
    navigate("/game");
    dispatch(setUserActiveGameId(null));
    // dispatch(deleteLocalGame(game));
    dispatch(clearLocalStateForGameDelete(game._id));
    socket.emit("leaveRoom", game._id);
  } else {
    console.log("це інший юзер -оновлюю масив юзерів");
    // dispatch(setLocalGame(game));
    // dispatch(updatePlayers(game));
    dispatch(removeUserFromGame({ game, deletedUser }));

    dispatch(gameApi.util.resetApiState()); // очищає весь стан gameApi
  }
};
