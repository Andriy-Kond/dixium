import socket from "services/socket.js";

export const joinToGameRoom = (currentGameId, userId) => {
  if (socket.connected && currentGameId && userId) {
    console.log(" joinToGameRoom >> userId:::", userId);
    console.log(" joinToGameRoom >> currentGameId:::", currentGameId);
    console.trace(" joinToGameRoom call stack");

    socket.emit("joinToGameRoom", {
      gameId: currentGameId,
      userId,
    });
  }
};
