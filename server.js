const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Room state management
const rooms = new Map();

const roomState = {
  users: new Set(),
  votes: new Map(),
  closed: false
};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] New client connected:`, {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      remoteAddress: socket.handshake.address,
      headers: socket.handshake.headers,
      url: socket.handshake.url
    });

    // Create room
    socket.on("room:create", ({ roomId, admin }) => {
      const id = roomId || generateRoomId();
      if (!rooms.has(id)) {
        rooms.set(id, {
          users: new Set(),
          votes: new Map(),
          closed: false
        });
      }
      const room = rooms.get(id);
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
      rooms.set(roomId, {
        users: new Set(),
        votes: new Map(),
        closed: false
      });
      io.to(roomId).emit("reset");
    });

    // Start voting
    socket.on("start-voting", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.isVotingOpen = true;
      io.to(roomId).emit("voting-started");
    });

    socket.on("room:leave", ({ roomId, user }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.users.delete(user);
      room.votes.delete(user);
      socket.leave(roomId);
      io.to(roomId).emit("presence", { users: Array.from(room.users) });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[${new Date().toISOString()}] Client disconnected:`, {
        socketId: socket.id,
        reason: reason,
        transport: socket.conn.transport.name
      });
    });

    socket.on("error", (error) => {
      console.error(`[${new Date().toISOString()}] Socket error:`, {
        socketId: socket.id,
        error: error.message,
        stack: error.stack
      });
    });
  });

  function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server running on port ${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
    console.log(`> Hostname: ${hostname}`);
    console.log(`> Port: ${port}`);
  });
});
