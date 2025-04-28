export const joinToGameRoom = (socket, currentGameId, userId) => {
  if (socket.connected && currentGameId && userId) {
    socket.emit("joinToGameRoom", {
      gameId: currentGameId,
      userId,
    });
  }
};
