// lib/socket.ts
import { io, Socket } from "socket.io-client";

const baseUrl =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin)
    : process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    console.log("Creating new socket connection to:", baseUrl);
    console.log("Environment variables:", {
      NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
      windowOrigin: typeof window !== "undefined" ? window.location.origin : "N/A"
    });
    
    socket = io(baseUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      withCredentials: true,
      timeout: 20000, // 20 second timeout
      forceNew: true, // Force new connection
    });

    // Add connection event listeners for debugging
    socket.on('connect', () => {
      console.log("Socket connected successfully to:", baseUrl);
    });

    socket.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on('disconnect', (reason) => {
      console.log("Socket disconnected:", reason);
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

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  // Force creation of new socket
  return getSocket();
};

export const testSocketEndpoint = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/socket`);
    const data = await response.json();
    console.log("Socket endpoint test:", { status: response.status, data });
    return { success: true, data };
  } catch (error) {
    console.error("Socket endpoint test failed:", error);
    return { success: false, error };
  }
};