import { io } from "socket.io-client";

// Create a socket instance with proper configuration
const URL = import.meta.env.VITE_SERVER_URL;

const socket = io(URL, {
  // Set to false so we can manually connect when user is authenticated
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Debug logging for socket events
socket.on("connect", () => {
  console.log("Socket connected successfully:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

export default socket;
