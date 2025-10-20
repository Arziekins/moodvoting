'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { Room, User, Vote } from '@/lib/types';
import JoinRoom from '@/components/JoinRoom';
import VotingRoom from '@/components/VotingRoom';

type AppState = 'join' | 'voting';

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
        isVotingOpen: true, // Start voting immediately
        showResults: false,
        createdAt: new Date(),
      };
      setRoom(newRoom);
      setAppState('voting'); // Go directly to voting, no lobby
    });

    // Handle presence updates (member list changes)
    socketInstance.on('presence', (data: { users: User[] }) => {
      console.log('[presence] update', {
        count: data.users.length,
        names: data.users.map(u => u.name),
        userIds: data.users.map(u => u.id),
        timestamp: new Date().toISOString()
      });
      
      // Update currentUser if they're in the presence list
      setCurrentUser(prevUser => {
        if (prevUser) {
          const updatedUser = data.users.find(u => u.id === socketInstance.id || u.name === prevUser.name);
          if (updatedUser) {
            console.log('[presence] Found currentUser in presence, updating', {
              oldId: prevUser.id,
              newId: updatedUser.id,
              name: updatedUser.name,
              socketId: socketInstance.id
            });
            return {
              ...updatedUser,
              isAdmin: prevUser.isAdmin // Preserve admin status
            };
          } else {
            console.log('[presence] WARNING: currentUser NOT found in presence list!', {
              currentUserId: prevUser.id,
              currentUserName: prevUser.name,
              socketId: socketInstance.id,
              presenceUserIds: data.users.map(u => u.id)
            });
          }
        }
        return prevUser;
      });
      
      setRoom(prevRoom => {
        if (prevRoom) {
          console.log('[presence] Updating room users', {
            oldCount: prevRoom.users.length,
            newCount: data.users.length
          });
          return {
            ...prevRoom,
            users: data.users
          };
        } else {
          console.log('[presence] No previous room, ignoring');
        }
        return prevRoom;
      });
    });

    socketInstance.on('room:joined', (data: { roomId: string }) => {
      console.log('Room joined:', data);
      // Create a basic room object for the UI - don't set users yet, wait for presence
      const joinedRoom: Room = {
        id: data.roomId,
        name: `Room ${data.roomId}`,
        adminId: '',
        users: [],
        isVotingOpen: true, // Assume voting is open when joining
        showResults: false,
        createdAt: new Date(),
      };
      setRoom(joinedRoom);
      setAppState('voting'); // Go directly to voting, no lobby
    });

    socketInstance.on('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      // Already in voting, no need to change state
    });

    socketInstance.on('voting-started', () => {
      // Ensure voting is open
      setRoom(prev => prev ? { ...prev, isVotingOpen: true, showResults: false } : prev);
    });

    socketInstance.on('closed', () => {
      // Voting closed; keep in voting view, hide results until reveal
      setRoom(prev => prev ? { ...prev, isVotingOpen: false } : prev);
    });

    socketInstance.on('reveal', (data: { results: { user: string; emoji: string; score: number }[] }) => {
      // Merge revealed results into users by id and show results
      console.log('[reveal] results', {
        count: data.results.length,
        sample: data.results.slice(0, 3)
      });
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

    // Handle session finished - redirect to home
    socketInstance.on('session-finished', () => {
      console.log('[session-finished] Room closed, redirecting to home');
      // Clean up state
      setRoom(null);
      setCurrentUser(null);
      setAppState('join');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleJoinRoom = (roomId: string, userName: string) => {
    if (socket) {
      console.log('[DEBUG] handleJoinRoom START', {
        socketId: socket.id,
        socketConnected: socket.connected,
        userName
      });
      // Store the user name for later use
      const newUser = {
        id: socket.id || 'unknown',
        name: userName,
        isAdmin: false,
        hasVoted: false,
      };
      console.log('[DEBUG] Setting currentUser', newUser);
      setCurrentUser(newUser);
      socket.emit('room:join', { roomId, user: userName, userId: socket.id });
    }
  };

  const handleCreateRoom = (userName: string) => {
    if (socket) {
      console.log('[DEBUG] handleCreateRoom START', {
        socketId: socket.id,
        socketConnected: socket.connected,
        userName
      });
      // Store the admin name for later use
      const newUser = {
        id: socket.id || 'unknown',
        name: userName,
        isAdmin: true,
        hasVoted: false,
      };
      console.log('[DEBUG] Setting currentUser (admin)', newUser);
      setCurrentUser(newUser);
      socket.emit('room:create', { admin: userName, userId: socket.id });
    }
  };

  const handleFinishSession = () => {
    if (socket && room) {
      socket.emit('finish-session', { roomId: room.id });
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

  // Always show voting room - no lobby
  return (
    <VotingRoom
      room={room}
      currentUser={currentUser}
      onFinishSession={handleFinishSession}
      onRevealResults={handleRevealResults}
      onResetVoting={handleResetVoting}
      onVote={handleVote}
    />
  );
}
