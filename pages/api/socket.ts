import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Room, User, Vote } from '@/lib/types';

// Store rooms in memory (in production, use Redis or database)
const rooms = new Map<string, Room>();

// Extend NextApiResponse to include socket server
interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket?.server) {
    res.status(500).json({ error: 'Socket server not available' });
    return;
  }

  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : '*',
      methods: ['GET', 'POST'],
    },
  });

  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Create room
    socket.on('create-room', ({ userName }) => {
      const roomId = generateRoomId();
      const user: User = {
        id: socket.id,
        name: userName,
        isAdmin: true,
        hasVoted: false,
      };

      const room: Room = {
        id: roomId,
        name: `Room ${roomId}`,
        adminId: socket.id,
        users: [user],
        isVotingOpen: false,
        showResults: false,
        createdAt: new Date(),
      };

      rooms.set(roomId, room);
      socket.join(roomId);
      socket.emit('room-created', room);
    });

    // Join room
    socket.on('join-room', ({ roomId, userName }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const user: User = {
        id: socket.id,
        name: userName,
        isAdmin: false,
        hasVoted: false,
      };

      room.users.push(user);
      socket.join(roomId);
      socket.emit('room-joined', { room, user });
      io.to(roomId).emit('room-updated', room);
    });

    // Start voting
    socket.on('start-voting', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.adminId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      room.isVotingOpen = true;
      room.showResults = false;
      io.to(roomId).emit('voting-started');
      io.to(roomId).emit('room-updated', room);
    });

    // Submit vote
    socket.on('submit-vote', ({ roomId, userId, vote }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.users.find(u => u.id === userId);
      if (user) {
        user.hasVoted = true;
        user.vote = vote;
        io.to(roomId).emit('room-updated', room);
      }
    });

    // Close voting
    socket.on('close-voting', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.adminId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      room.isVotingOpen = false;
      io.to(roomId).emit('voting-closed');
      io.to(roomId).emit('room-updated', room);
    });

    // Reveal results
    socket.on('reveal-results', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.adminId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      room.showResults = true;
      io.to(roomId).emit('results-revealed');
      io.to(roomId).emit('room-updated', room);
    });

    // Reset voting
    socket.on('reset-voting', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.adminId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      room.isVotingOpen = true;
      room.showResults = false;
      room.users.forEach(user => {
        user.hasVoted = false;
        user.vote = undefined;
      });

      io.to(roomId).emit('voting-started');
      io.to(roomId).emit('room-updated', room);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        const userIndex = room.users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
          room.users.splice(userIndex, 1);
          
          // If admin left, assign new admin or close room
          if (room.adminId === socket.id) {
            if (room.users.length > 0) {
              room.adminId = room.users[0].id;
              room.users[0].isAdmin = true;
            } else {
              rooms.delete(roomId);
              return;
            }
          }
          
          io.to(roomId).emit('room-updated', room);
        }
      });
    });
  });

  res.end();
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
