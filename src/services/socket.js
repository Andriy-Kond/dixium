import { io } from "socket.io-client";
const { REACT_APP_BASE_URL, REACT_APP_BASE_URL_DEPLOY } = process.env;

const socket = io(REACT_APP_BASE_URL_DEPLOY, {
  autoConnect: true,
  reconnectionAttempts: 5, // Обмежити кількість спроб перепідключення
  reconnectionDelay: 1000, // Затримка між спробами
});

export default socket;
