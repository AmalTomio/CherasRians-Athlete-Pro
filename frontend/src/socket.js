import { io } from "socket.io-client";

let socket;

export const initSocket = (token) => {
  if (!token) return;

  socket = io("http://localhost:5000", {
    auth: { token }
  });
};

export const getSocket = () => socket;