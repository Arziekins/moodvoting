// pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

type NextApiResponseWithIO = NextApiResponse & {
  socketServer?: IOServer;
};

type RoomState = {
  users: Set<string>;
  votes: Map<string, { emoji: string; score: number }>;
  closed: boolean;
};

// Persist state in the single Node process
const rooms: Map<string, RoomState> = (global as any).moodRooms || new Map();
(global as any).moodRooms = rooms;

export default function handler(req: NextApiRequest, res: NextApiResponseWithIO) {
  // Attach once
  if (!res.socketServer) {
    // On Next.js API routes, the underlying Node server is at res.socket.server
    const httpServer = (res as any)?.socket?.server as HTTPServer | undefined;
    if (!httpServer) {
      res.status(503).json({ error: "Socket server not ready" });
      return;
    }

    const io = new IOServer(httpServer, {
      path: "/api/socket",
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // Create room
      socket.on("room:create", ({ roomId, admin }) => {
        const id = roomId || crypto.randomUUID();
        if (!rooms.has(id)) {
          rooms.set(id, { users: new Set(), votes: new Map(), closed: false });
        }
        const room = rooms.get(id)!;
        room.users.add(admin);
        socket.join(id);
        io.to(id).emit("presence", { users: Array.from(room.users) });
        socket.emit("room:created", { roomId: id });
      });

      // Join room
      socket.on("room:join", ({ roomId, user }) => {
        const room = rooms.get(roomId);
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }
        room.users.add(user);
        socket.join(roomId);
        io.to(roomId).emit("presence", { users: Array.from(room.users) });
        socket.emit("room:joined", { roomId });
      });

      // Vote
      socket.on("vote", ({ roomId, user, emoji, score }) => {
        const room = rooms.get(roomId);
        if (!room || room.closed) return;
        room.votes.set(user, { emoji, score });
        socket.emit("vote:ack", { ok: true });
      });

      socket.on("close", ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        room.closed = true;
        io.to(roomId).emit("closed");
      });

      socket.on("reveal", ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        const results = Array.from(room.votes.entries()).map(([user, v]) => ({ user, ...v }));
        io.to(roomId).emit("reveal", { results });
      });

      socket.on("reset", ({ roomId }) => {
        rooms.set(roomId, { users: new Set(), votes: new Map(), closed: false });
        io.to(roomId).emit("reset");
      });

      socket.on("room:leave", ({ roomId, user }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        room.users.delete(user);
        room.votes.delete(user);
        socket.leave(roomId);
        io.to(roomId).emit("presence", { users: Array.from(room.users) });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    // Mark initialized
    res.socketServer = io;
  }

  // Always respond 200 so Next knows the route is healthy
  res.status(200).json({ ok: true });
}