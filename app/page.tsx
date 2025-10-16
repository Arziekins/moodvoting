'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { Room, User, Vote } from '@/lib/types';
import JoinRoom from '@/components/JoinRoom';
import RoomLobby from '@/components/RoomLobby';
import VotingRoom from '@/components/VotingRoom';

type AppState = 'join' | 'lobby' | 'voting';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('join');
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('room:created', (data: { roomId: string }) => {
      console.log('Room created:', data);
      // Create a basic room object for the UI
      const newRoom: Room = {
        id: data.roomId,
        name: `Room ${data.roomId}`,
        adminId: socketInstance.id || 'unknown',
        users: [],
        isVotingOpen: false,
        showResults: false,
        createdAt: new Date(),
      };
      setRoom(newRoom);
      setAppState('lobby');
    });

    // Handle presence updates (member list changes)
    socketInstance.on('presence', (data: { users: User[] }) => {
      console.log('Presence update:', data);
      setRoom(prevRoom => {
        if (prevRoom) {
          return {
            ...prevRoom,
            users: data.users
          };
        }
        return prevRoom;
      });
    });

    socketInstance.on('room:joined', (data: { roomId: string }) => {
      console.log('Room joined:', data);
      // Create a basic room object for the UI
      const joinedRoom: Room = {
        id: data.roomId,
        name: `Room ${data.roomId}`,
        adminId: '',
        users: [],
        isVotingOpen: false,
        showResults: false,
        createdAt: new Date(),
      };
      setRoom(joinedRoom);
      setAppState('lobby');
    });

    socketInstance.on('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (updatedRoom.isVotingOpen) {
        setAppState('voting');
      }
    });

    socketInstance.on('voting-started', () => {
      // Move to voting and mark room as voting open
      setAppState('voting');
      setRoom(prev => prev ? { ...prev, isVotingOpen: true, showResults: false } : prev);
    });

    socketInstance.on('closed', () => {
      // Voting closed; keep in voting view, hide results until reveal
      setRoom(prev => prev ? { ...prev, isVotingOpen: false } : prev);
    });

    socketInstance.on('reveal', (data: { results: { user: string; emoji: string; score: number }[] }) => {
      // Merge revealed results into users by id and show results
      setRoom(prev => {
        if (!prev) return prev;
        const idToVote = new Map<string, { emoji: string; score: number }>();
        for (const r of data.results) idToVote.set(r.user, { emoji: r.emoji, score: r.score });
        const users = prev.users.map(u => {
          const v = idToVote.get(u.id);
          return v ? { ...u, vote: { emoji: v.emoji, scale: v.score }, hasVoted: true } : u;
        });
        return { ...prev, users, showResults: true, isVotingOpen: false };
      });
    });

    socketInstance.on('reset', () => {
      // New round; clear votes and reopen lobby/voting state as closed
      setRoom(prev => {
        if (!prev) return prev;
        const users = prev.users.map(u => ({ ...u, hasVoted: false, vote: undefined }));
        return { ...prev, users, isVotingOpen: false, showResults: false };
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleJoinRoom = (roomId: string, userName: string) => {
    if (socket) {
      // Store the user name for later use
      setCurrentUser({
        id: socket.id || 'unknown',
        name: userName,
        isAdmin: false,
        hasVoted: false,
      });
      socket.emit('room:join', { roomId, user: userName });
    }
  };

  const handleCreateRoom = (userName: string) => {
    if (socket) {
      // Store the admin name for later use
      setCurrentUser({
        id: socket.id || 'unknown',
        name: userName,
        isAdmin: true,
        hasVoted: false,
      });
      socket.emit('room:create', { admin: userName });
    }
  };

  const handleStartVoting = () => {
    if (socket && room) {
      socket.emit('start-voting', { roomId: room.id });
    }
  };

  const handleCloseVoting = () => {
    if (socket && room) {
      socket.emit('close', { roomId: room.id });
    }
  };

  const handleRevealResults = () => {
    if (socket && room) {
      socket.emit('reveal', { roomId: room.id });
    }
  };

  const handleResetVoting = () => {
    if (socket && room) {
      socket.emit('reset', { roomId: room.id });
    }
  };

  const handleVote = (vote: Vote) => {
    if (socket && currentUser) {
      socket.emit('vote', { 
        roomId: room?.id, 
        user: currentUser.name, 
        emoji: vote.emoji,
        score: vote.scale
      });
    }
  };

  if (!room || !currentUser) {
    return <JoinRoom onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />;
  }

  if (appState === 'lobby') {
    return (
      <RoomLobby
        roomId={room.id}
        userName={currentUser.name}
        isAdmin={currentUser.isAdmin}
        users={room.users}
        onStartVoting={handleStartVoting}
      />
    );
  }

  if (appState === 'voting') {
    return (
      <VotingRoom
        room={room}
        currentUser={currentUser}
        onCloseVoting={handleCloseVoting}
        onRevealResults={handleRevealResults}
        onResetVoting={handleResetVoting}
        onVote={handleVote}
      />
    );
  }

  return null;
}
