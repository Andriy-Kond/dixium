import { io } from "socket.io-client";
const { REACT_APP_BASE_URL } = process.env;
const socket = io(REACT_APP_BASE_URL);
export default socket;
