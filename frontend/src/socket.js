import { io } from "socket.io-client";

let socket = null;

const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    console.error("❌ VITE_API_URL is not defined");
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
    withCredentials: true, // 🔥 IMPORTANT for CORS
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
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