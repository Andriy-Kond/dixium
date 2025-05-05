import { authApi } from "redux/auth/authApi.js";
import { gameApi } from "redux/game/gameApi.js";
import socket from "services/socket.js";

export const joinToGameRoom = (gameId, userId, dispatch) => {
  if (socket.connected && gameId && userId) {
    console.log("joinToGameRoom");
    // console.trace("joinToGameRoom call stack");
    // console.log("joinToGameRoom >> userId:::", userId);
    // console.log("joinToGameRoom >> gameId:::", gameId);

    socket.emit("joinToGameRoom", {
      gameId,
      userId,
    });

    // dispatch(authApi.util.invalidateTags(["User"])); // update authApi
    // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: gameId }]));
    // dispatch(gameApi.util.invalidateTags(["Game"]));
    // dispatch(gameApi.util.getCurrentGame(gameId));
  }
};
