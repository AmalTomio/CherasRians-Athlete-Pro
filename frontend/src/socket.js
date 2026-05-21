import { io } from "socket.io-client";

let socket = null;

const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  console.log("SOCKET API URL:", apiUrl);

  if (!apiUrl) {
    console.error("VITE_API_URL is missing");
    return null;
  }

  try {
    const url = new URL(apiUrl);

    console.log("SOCKET BASE URL:", url.origin);

    return url.origin;
  } catch (err) {
    console.error("Invalid VITE_API_URL:", apiUrl);
    return null;
  }
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
    console.log("✅ Socket connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("🚨 Socket connection error:", err.message);
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