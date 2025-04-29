import socket from "services/socket.js";

export const socketConnection = (event, userId, gameId) => {
  // console.log(`Socket event: ${event}, socket.id: ${socket.id}`);
  if (userId) {
    socket.emit("registerUserId", { userId });
  } else {
    console.log(`Socket ${event}ed, but user is not logged in`);
  }
};
