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
  users: new Map(), // Changed from Set to Map to store user objects
  votes: new Map(),
  closed: false
};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const startTime = Date.now();
      const isApi = req.url && req.url.startsWith('/api');
      console.log(`[${new Date().toISOString()}] Incoming request`, {
        method: req.method,
        url: req.url,
        isApi,
        host: req.headers['host'],
        userAgent: req.headers['user-agent']
      });
      res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] Response finished`, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          durationMs: Date.now() - startTime
        });
      });
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

  const { sendRecapToSlack } = require('./lib/slack.js');
  const { prisma } = require('./lib/prisma.cjs');

  io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] New client connected:`, {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      remoteAddress: socket.handshake.address,
      headers: socket.handshake.headers,
      url: socket.handshake.url
    });

    // Create room
    socket.on("room:create", ({ admin, userId }) => {
      // Always generate a 4-digit code on the server; ignore any client-provided id
      let id = generateRoomId();
      while (rooms.has(id)) {
        id = generateRoomId();
      }
      rooms.set(id, {
        users: new Map(),
        votes: new Map(),
        closed: false,
        isVotingOpen: true // Start voting immediately
      });
      const room = rooms.get(id);
      const adminUser = {
        id: socket.id,
        userId: userId || socket.id,
        name: admin,
        isAdmin: true,
        hasVoted: false
      };
      room.users.set(socket.id, adminUser);
      socket.join(id);
      
      console.log(`[${new Date().toISOString()}] room:create -> about to send events`, {
        roomId: id,
        userCount: room.users.size,
        users: Array.from(room.users.values()).map(u => ({ id: u.id, name: u.name }))
      });
      
      // CRITICAL: Send room:created FIRST so client creates room object
      socket.emit("room:created", { roomId: id });
      console.log(`[${new Date().toISOString()}] [DEBUG] room:created sent`, {
        roomId: id,
        socketId: socket.id
      });
      
      // Notify the creator that voting has started
      socket.emit("voting-started");
      
      // NOW send presence events (after room:created so client has room object)
      console.log(`[${new Date().toISOString()}] room:create -> now emitting presence`, {
        roomId: id,
        userCount: room.users.size
      });
      socket.emit("presence", { users: Array.from(room.users.values()) });
      io.to(id).emit("presence", { users: Array.from(room.users.values()) });
      console.log(`[${new Date().toISOString()}] room:create -> presence emitted AFTER room:created`, {
        roomId: id,
        userCount: room.users.size
      });
    });

    // Join room
    socket.on("room:join", ({ roomId, user, userId }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      
      // Prevent joining finished rooms
      if (room.finished) {
        socket.emit("error", { message: "This room has finished. Please create or join another room." });
        return;
      }
      
      console.log(`[${new Date().toISOString()}] [DEBUG] room:join START`, {
        roomId,
        userName: user,
        socketId: socket.id,
        currentRoomState: {
          userCount: room.users.size,
          isVotingOpen: room.isVotingOpen,
          closed: room.closed,
          finished: room.finished
        }
      });
      
      // Try to find existing user by userId
      let rejoined = false;
      if (userId) {
        for (const [sid, u] of room.users.entries()) {
          if (u.userId && u.userId === userId) {
            // Update socket id and mark online
            room.users.delete(sid);
            room.votes.delete(sid);
            room.users.set(socket.id, { ...u, id: socket.id, name: user, hasVoted: !!u.hasVoted, offline: false, offlineAt: undefined });
            rejoined = true;
            console.log(`[${new Date().toISOString()}] [DEBUG] User rejoining`, { userId, oldSocketId: sid, newSocketId: socket.id });
            break;
          }
        }
      }
      if (!rejoined) {
        const newUser = {
          id: socket.id,
          userId: userId || socket.id,
          name: user,
          isAdmin: false,
          hasVoted: false
        };
        room.users.set(socket.id, newUser);
        console.log(`[${new Date().toISOString()}] [DEBUG] New user added to room`, { socketId: socket.id, userName: user });
      }
      
      // Join the socket.io room FIRST
      socket.join(roomId);
      
      console.log(`[${new Date().toISOString()}] [DEBUG] Socket joined room, checking membership`, {
        roomId,
        socketId: socket.id,
        roomMembersBeforeEmit: Array.from((io.sockets.adapter.rooms.get(roomId) || new Set()))
      });
      
      const allSocketIdsAfter = Array.from((io.sockets.adapter.rooms.get(roomId) || new Set()));
      console.log(`[${new Date().toISOString()}] room:join -> about to send events`, {
        roomId,
        userName: user,
        roomUserCount: room.users.size,
        allSocketIds: allSocketIdsAfter
      });
      
      // CRITICAL: Send room:joined FIRST so client creates room object
      socket.emit("room:joined", { roomId });
      console.log(`[${new Date().toISOString()}] [DEBUG] room:joined sent to new joiner`, {
        socketId: socket.id,
        roomId
      });
      
      // Send current voting state to the new joiner
      if (room.isVotingOpen) {
        console.log(`[${new Date().toISOString()}] [DEBUG] Sending voting-started to new joiner`, {
          socketId: socket.id,
          roomId
        });
        socket.emit("voting-started");
      }
      
      // NOW send presence events (after room:joined so client has room object)
      console.log(`[${new Date().toISOString()}] room:join -> now emitting presence`, {
        roomId,
        userName: user,
        roomUserCount: room.users.size
      });
      
      // Send presence directly to the joiner
      socket.emit("presence", { users: Array.from(room.users.values()) });
      console.log(`[${new Date().toISOString()}] [DEBUG] Direct presence sent to joiner AFTER room:joined`, {
        socketId: socket.id,
        userCount: room.users.size
      });
      
      // Broadcast to everyone in the room
      io.to(roomId).emit("presence", { users: Array.from(room.users.values()) });
      console.log(`[${new Date().toISOString()}] [DEBUG] Broadcast presence sent to room`, {
        roomId,
        userCount: room.users.size
      });
      
      console.log(`[${new Date().toISOString()}] [DEBUG] room:join COMPLETE`, {
        roomId,
        socketId: socket.id,
        userName: user,
        totalUsers: room.users.size
      });
    });

    // Vote
    socket.on("vote", ({ roomId, user, userId, emoji, score }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.votes.set(socket.id, { emoji, score });
      // Update user's hasVoted status
      const userObj = room.users.get(socket.id);
      if (userObj) {
        userObj.hasVoted = true;
        userObj.vote = { emoji, scale: score };
      }
      console.log(`[${new Date().toISOString()}] vote received`, {
        roomId,
        socketId: socket.id,
        user,
        userId: userId || userObj?.userId,
        score,
        isVotingOpen: !!room.isVotingOpen,
        totalVotes: room.votes.size,
        totalUsers: room.users.size
      });
      socket.emit("vote:ack", { ok: true });
      // Broadcast updated user list
      console.log(`[${new Date().toISOString()}] vote -> presence about to emit`, {
        roomId,
        userCount: room.users.size
      });
      io.to(roomId).emit("presence", { users: Array.from(room.users.values()) });
      console.log(`[${new Date().toISOString()}] vote -> presence emitted`, {
        roomId,
        userCount: room.users.size
      });

      // Auto-reveal results if all ONLINE users have voted
      const onlineUsers = Array.from(room.users.values()).filter(u => !u.offline);
      const allVoted = onlineUsers.length > 0 && onlineUsers.every(u => u.hasVoted);
      
      console.log(`[${new Date().toISOString()}] [AUTO-REVEAL CHECK]`, {
        roomId,
        totalUsers: room.users.size,
        onlineUsers: onlineUsers.length,
        votedUsers: onlineUsers.filter(u => u.hasVoted).length,
        allVoted,
        userDetails: onlineUsers.map(u => ({ name: u.name, hasVoted: u.hasVoted }))
      });
      
      if (allVoted) {
        const results = Array.from(room.votes.entries()).map(([user, v]) => ({ user, ...v }));
        console.log(`[${new Date().toISOString()}] ✅ AUTO-REVEAL TRIGGERED - All online users have voted!`, {
          roomId,
          votes: results.length,
          onlineUsers: onlineUsers.length
        });
        io.to(roomId).emit("reveal", { results });
        // Fire-and-forget Slack recap
        try {
          const usersForSlack = Array.from(room.users.values()).map(u => ({ name: u.name, vote: u.vote }));
          sendRecapToSlack(roomId, usersForSlack).catch(() => {});
        } catch (e) {
          console.warn('[slack] recap send failed', e);
        }
      }
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
      // Also send Slack recap on manual reveal
      try {
        const usersForSlack = Array.from(room.users.values()).map(u => ({ name: u.name, vote: u.vote }));
        sendRecapToSlack(roomId, usersForSlack).catch(() => {});
      } catch (e) {
        console.warn('[slack] recap send failed', e);
      }
    });

    socket.on("reset", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      // Reset votes and voting status but keep users
      room.votes.clear();
      room.closed = false;
      room.isVotingOpen = false;
      // Reset all users' voting status
      for (const user of room.users.values()) {
        user.hasVoted = false;
        user.vote = undefined;
      }
      console.log(`[${new Date().toISOString()}] reset -> presence about to emit`, {
        roomId,
        userCount: room.users.size
      });
      io.to(roomId).emit("presence", { users: Array.from(room.users.values()) });
      console.log(`[${new Date().toISOString()}] reset -> presence emitted`, {
        roomId,
        userCount: room.users.size
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

    // Finish session -> persist later and notify clients
    socket.on("finish-session", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      
      // Mark room as finished
      room.finished = true;
      room.isVotingOpen = false;
      
      io.to(roomId).emit("session-finished", { roomId });
      // Optionally send recap on finish
      try {
        const usersForSlack = Array.from(room.users.values()).map(u => ({ name: u.name, vote: u.vote }));
        sendRecapToSlack(roomId, usersForSlack).catch(() => {});
      } catch (e) {
        console.warn('[slack] recap send failed', e);
      }
      // Persist snapshot to DB (best-effort)
      (async () => {
        try {
          await prisma.room.upsert({
            where: { id: roomId },
            update: {
              finishedAt: new Date(),
            },
            create: {
              id: roomId,
              finishedAt: new Date(),
            }
          });
          const usersArray = Array.from(room.users.values());
          for (const u of usersArray) {
            await prisma.roomUser.create({
              data: { roomId, userId: u.userId || u.id, name: u.name }
            });
          }
          for (const [sid, v] of room.votes.entries()) {
            const u = room.users.get(sid);
            await prisma.roomVote.create({
              data: { roomId, userId: (u && (u.userId || u.id)) || sid, name: (u && u.name) || 'Unknown', emoji: v.emoji, scale: v.score }
            });
          }
          console.log(`[${new Date().toISOString()}] Session persisted`, { roomId });
        } catch (e) {
          console.warn('[prisma] persist failed', e);
        }
      })();
    });

    socket.on("room:leave", ({ roomId, user }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.users.delete(socket.id);
      room.votes.delete(socket.id);
      socket.leave(roomId);
      console.log(`[${new Date().toISOString()}] room:leave -> presence about to emit`, {
        roomId,
        leavingSocketId: socket.id,
        userCount: room.users.size
      });
      io.to(roomId).emit("presence", { users: Array.from(room.users.values()) });
      console.log(`[${new Date().toISOString()}] room:leave -> presence emitted`, {
        roomId,
        userCount: room.users.size
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[${new Date().toISOString()}] Client disconnected:`, {
        socketId: socket.id,
        reason: reason,
        transport: socket.conn.transport.name
      });
      
      // Clean up user from all rooms
      const roomsAffected = [];
      const remainingUserCounts = {};
      for (const [roomId, room] of rooms.entries()) {
        if (room.users.has(socket.id)) {
          const userObj = room.users.get(socket.id);
          if (userObj) {
            userObj.offline = true;
            userObj.offlineAt = Date.now();
          }
          // Keep user in list but mark offline; do not delete to allow rejoin
          // Remove vote associated with old socket
          room.votes.delete(socket.id);
          console.log(`[${new Date().toISOString()}] disconnect -> user marked offline, emitting presence`, {
            roomId,
            remainingUsers: room.users.size
          });
          roomsAffected.push(roomId);
          remainingUserCounts[roomId] = room.users.size;
          io.to(roomId).emit("presence", { users: Array.from(room.users.values()) });
        }
      }
      if (roomsAffected.length > 0) {
        console.log(`[${new Date().toISOString()}] disconnect summary`, {
          socketId: socket.id,
          roomsAffected,
          remainingUserCounts
        });
      }
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
    // 4-digit numeric room code (1000-9999)
    return Math.floor(1000 + Math.random() * 9000).toString();
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
