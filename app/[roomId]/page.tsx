'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { Room, User, Vote } from '@/lib/types';
import VotingRoom from '@/components/VotingRoom';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('room:joined', (data: { roomId: string }) => {
      console.log('Room joined:', data);
      const joinedRoom: Room = {
        id: data.roomId,
        name: `Room ${data.roomId}`,
        adminId: '',
        users: [],
        isVotingOpen: true,
        showResults: false,
        createdAt: new Date(),
      };
      setRoom(joinedRoom);
      setIsJoining(false);
    });

    socketInstance.on('presence', (data: { users: User[] }) => {
      console.log('[presence] update', data);
      
      setCurrentUser(prevUser => {
        if (prevUser) {
          const updatedUser = data.users.find(u => u.id === socketInstance.id || u.name === prevUser.name);
          if (updatedUser) {
            return {
              ...updatedUser,
              isAdmin: prevUser.isAdmin
            };
          }
        }
        return prevUser;
      });
      
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

    socketInstance.on('voting-started', () => {
      setRoom(prev => prev ? { ...prev, isVotingOpen: true, showResults: false } : prev);
    });

    socketInstance.on('closed', () => {
      setRoom(prev => prev ? { ...prev, isVotingOpen: false } : prev);
    });

    socketInstance.on('reveal', (data: { results: { user: string; emoji: string; score: number }[] }) => {
      console.log('[reveal] results', data);
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
      setRoom(prev => {
        if (!prev) return prev;
        const users = prev.users.map(u => ({ ...u, hasVoted: false, vote: undefined }));
        return { ...prev, users, isVotingOpen: false, showResults: false };
      });
    });

    // Handle session finished - redirect to home
    socketInstance.on('session-finished', () => {
      console.log('[session-finished] Room closed, redirecting to home');
      // Clean up
      setRoom(null);
      setCurrentUser(null);
      // Redirect to home page
      router.push('/');
    });

    socketInstance.on('error', (error: any) => {
      console.error('[socket error]', error);
      setError(error.message || 'Failed to join room');
      setIsJoining(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [router]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && userName.trim()) {
      setIsJoining(true);
      setError('');
      
      const newUser = {
        id: socket.id || 'unknown',
        name: userName.trim(),
        isAdmin: false,
        hasVoted: false,
      };
      
      setCurrentUser(newUser);
      socket.emit('room:join', { roomId, user: userName.trim(), userId: socket.id });
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

  // Show join form if not in room yet
  if (!room || !currentUser) {
    return (
      <div className="min-h-screen apple-gradient-bg flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md scale-in">
          <div className="apple-card p-8 sm:p-10">
            {/* App Icon/Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 apple-gradient-purple rounded-3xl mb-6 shadow-apple">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="15" cy="18" r="1.5" fill="white"/>
                  <circle cx="25" cy="18" r="1.5" fill="white"/>
                  <path d="M15 24C15 24 17 26 20 26C23 26 25 24 25 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="apple-title mb-2">Join Room</h1>
              <div className="inline-block bg-apple-purple-50 px-4 py-2 rounded-xl border border-apple-purple-200 mb-4">
                <span className="text-sm text-apple-purple-600 font-medium">Room Code:</span>
                <span className="ml-2 text-2xl font-mono font-bold text-apple-purple-900">{roomId}</span>
              </div>
              <p className="apple-caption">Enter your name to join the mood check</p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="apple-input"
                  required
                  disabled={isJoining}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!userName.trim() || isJoining}
                className="w-full apple-button-primary"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-apple-gray-500 hover:text-apple-gray-700"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show voting room
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

