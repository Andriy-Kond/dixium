import { io } from "socket.io-client";
const { REACT_APP_BASE_URL } = process.env;
const socket = io(REACT_APP_BASE_URL);
export default socket;

// socket.on("connect", () => {
//   console.log("Socket connected:", socket.id);
// });

// socket.on("disconnect", () => {
//   console.log("Socket disconnected");
// });

// socket.on("reconnect", attempt => {
//   console.log("Socket reconnected after attempt:", attempt);
// });

// socket.on("reconnect_error", error => {
//   console.error("Reconnect error:", error);
// });

// import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_SERVER_URL, {
//   reconnection: true,  // Автоматичне перепідключення
//   reconnectionAttempts: 10, // Кількість спроб
//   reconnectionDelay: 500, // Інтервал між спробами
//   transports: ["websocket"], // Використовувати WebSocket

// reconnection: true, // Увімкнути повторне підключення
// reconnectionAttempts: Infinity, // Нескінченна кількість спроб
// reconnectionDelay: 1000, // Затримка між спробами (1 секунда)
// reconnectionDelayMax: 5000, // Максимальна затримка
// autoConnect: true, // Автоматичне підключення
// });

// export default socket;
