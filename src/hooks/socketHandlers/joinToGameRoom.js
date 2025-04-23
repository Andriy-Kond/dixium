export const joinToGameRoom = (socket, currentGameId, userCredentials) => {
  if (socket.connected && currentGameId && userCredentials._id) {
    socket.emit("joinToGameRoom", {
      gameId: currentGameId,
      player: userCredentials,
    });
  }
};
