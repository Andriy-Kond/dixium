import { io } from "socket.io-client";
const { REACT_APP_BASE_URL } = process.env;
const socket = io(REACT_APP_BASE_URL);
export default socket;

// import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_SERVER_URL, {
//   reconnection: true,  // Автоматичне перепідключення
//   reconnectionAttempts: 10, // Кількість спроб
//   reconnectionDelay: 500, // Інтервал між спробами
//   transports: ["websocket"], // Використовувати WebSocket
// });

// export default socket;
