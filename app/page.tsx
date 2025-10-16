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
      // Create a basic user object for the admin
      const adminUser: User = {
        id: socketInstance.id || 'unknown',
        name: 'Admin', // We'll need to get this from the creation process
        isAdmin: true,
        hasVoted: false,
      };
      setRoom(newRoom);
      setCurrentUser(adminUser);
      setAppState('lobby');
    });

    socketInstance.on('room:joined', (data: { roomId: string }) => {
      console.log('Room joined:', data);
      // We need to get the room data from the server
      // For now, create a basic room object
      const joinedRoom: Room = {
        id: data.roomId,
        name: `Room ${data.roomId}`,
        adminId: '',
        users: [],
        isVotingOpen: false,
        showResults: false,
        createdAt: new Date(),
      };
      // Create a basic user object for the member
      const memberUser: User = {
        id: socketInstance.id || 'unknown',
        name: 'Member', // We'll need to get this from the join process
        isAdmin: false,
        hasVoted: false,
      };
      setRoom(joinedRoom);
      setCurrentUser(memberUser);
      setAppState('lobby');
    });

    socketInstance.on('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (updatedRoom.isVotingOpen) {
        setAppState('voting');
      }
    });

    socketInstance.on('voting-started', () => {
      setAppState('voting');
    });

    socketInstance.on('voting-closed', () => {
      // Voting closed, but still in voting state until results are revealed
    });

    socketInstance.on('results-revealed', () => {
      // Results revealed, stay in voting state
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleJoinRoom = (roomId: string, userName: string) => {
    if (socket) {
      socket.emit('room:join', { roomId, user: userName });
    }
  };

  const handleCreateRoom = (userName: string) => {
    if (socket) {
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
