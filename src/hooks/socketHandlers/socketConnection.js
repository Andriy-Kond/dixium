const { joinToGameRoom } = require("./joinToGameRoom.js");

export const socketConnection = (event, socket, userId, gameId) => {
  console.log(`Socket event: ${event}, socket.id: ${socket.id}`);
  if (userId) {
    socket.emit("registerUserId", { userId });
    joinToGameRoom(socket, gameId, userId);
  } else {
    console.log(`Socket ${event}ed, but user is not logged in`);
  }
};
