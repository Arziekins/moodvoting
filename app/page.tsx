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
    socketInstance.on('room-created', (newRoom: Room) => {
      setRoom(newRoom);
      setAppState('lobby');
    });

    socketInstance.on('room-joined', (data: { room: Room; user: User }) => {
      setRoom(data.room);
      setCurrentUser(data.user);
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
      socket.emit('join-room', { roomId, userName });
    }
  };

  const handleCreateRoom = (userName: string) => {
    if (socket) {
      socket.emit('create-room', { userName });
    }
  };

  const handleStartVoting = () => {
    if (socket && room) {
      socket.emit('start-voting', { roomId: room.id });
    }
  };

  const handleCloseVoting = () => {
    if (socket && room) {
      socket.emit('close-voting', { roomId: room.id });
    }
  };

  const handleRevealResults = () => {
    if (socket && room) {
      socket.emit('reveal-results', { roomId: room.id });
    }
  };

  const handleResetVoting = () => {
    if (socket && room) {
      socket.emit('reset-voting', { roomId: room.id });
    }
  };

  const handleVote = (vote: Vote) => {
    if (socket && currentUser) {
      socket.emit('submit-vote', { 
        roomId: room?.id, 
        userId: currentUser.id, 
        vote 
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
