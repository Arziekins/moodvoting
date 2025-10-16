// lib/socket.ts
import { io, Socket } from "socket.io-client";

const baseUrl =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin)
    : process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(baseUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};