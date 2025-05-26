import { io } from "socket.io-client";
const {
  REACT_APP_BASE_URL, // DEV: http://localhost:3001, DEPLOY: https://dixium-backend-mongo-cloudinary.onrender.com
} = process.env;

const socket = io(REACT_APP_BASE_URL, {
  autoConnect: true,
  reconnectionAttempts: 5, // Обмежити кількість спроб перепідключення
  reconnectionDelay: 1000, // Затримка між спробами
});

export default socket;
