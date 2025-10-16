// lib/socket.ts
import { io, Socket } from "socket.io-client";

// For production on Render, connect directly to the main server
// For development, use localhost:3000
const baseUrl =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin)
    : process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    console.log(`[${new Date().toISOString()}] Creating new socket connection to:`, baseUrl);
    console.log(`[${new Date().toISOString()}] Environment variables:`, {
      NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
      windowOrigin: typeof window !== "undefined" ? window.location.origin : "N/A",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "N/A"
    });
    
    const socketConfig = {
      transports: ["websocket", "polling"],
      withCredentials: true,
      timeout: 20000, // 20 second timeout
      forceNew: true, // Force new connection
    };
    
    console.log(`[${new Date().toISOString()}] Socket.io client config:`, socketConfig);
    
    socket = io(baseUrl, socketConfig);

    // Add connection event listeners for debugging
    socket.on('connect', () => {
      console.log(`[${new Date().toISOString()}] Socket connected successfully to:`, baseUrl);
      console.log(`[${new Date().toISOString()}] Socket ID:`, socket?.id);
      console.log(`[${new Date().toISOString()}] Transport:`, socket?.io?.engine?.transport?.name);
    });

    socket.on('connect_error', (error) => {
      console.error(`[${new Date().toISOString()}] Socket connection error:`, {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type,
        transport: socket?.io?.engine?.transport?.name
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[${new Date().toISOString()}] Socket disconnected:`, reason);
    });

    socket.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] Socket error:`, error);
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
    console.log(`[${new Date().toISOString()}] Testing socket server availability: ${baseUrl}`);
    const response = await fetch(`${baseUrl}/api/test-socket`);
    console.log(`[${new Date().toISOString()}] Test endpoint response:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });
    
    const contentType = response.headers.get('content-type');
    console.log(`[${new Date().toISOString()}] Response content type:`, contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Socket server test successful:`, data);
      return { success: true, data };
    } else {
      const text = await response.text();
      console.error(`[${new Date().toISOString()}] Test endpoint returned non-JSON:`, text.substring(0, 200));
      return { success: false, error: `Expected JSON but got ${contentType}: ${text.substring(0, 100)}...` };
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Socket server test failed:`, error);
    return { success: false, error };
  }
};