import { io } from "socket.io-client";

let socket = null;

const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    return null;
  }

  return apiUrl.replace("/api", "");
};

export const initSocket = (token) => {
  if (!token) return null;

  if (socket && socket.connected) return socket;

  const baseURL = getBaseURL();
  if (!baseURL) return null;

  socket = io(baseURL, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true, 
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
  });

  socket.on("disconnect", (reason) => {
  });

  socket.on("connect_error", (err) => {
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected manually");
  }
};