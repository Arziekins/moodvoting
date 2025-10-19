'use client';

import { useState, useEffect } from 'react';
import { Users, Eye, RotateCcw, Flag } from 'lucide-react';
import MoodCard from './MoodCard';
import { Room, User, Vote } from '@/lib/types';

interface VotingRoomProps {
  room: Room;
  currentUser: User;
  onFinishSession: () => void;
  onRevealResults: () => void;
  onResetVoting: () => void;
  onVote: (vote: Vote) => void;
}

export default function VotingRoom({ 
  room, 
  currentUser, 
  onFinishSession, 
  onRevealResults, 
  onResetVoting, 
  onVote 
}: VotingRoomProps) {
  const [showResults, setShowResults] = useState(room.showResults);

  useEffect(() => {
    setShowResults(room.showResults);
  }, [room.showResults]);
  
  // Debug log to check if currentUser is in room.users
  useEffect(() => {
    const userInRoom = room.users.find(u => u.id === currentUser.id);
    console.log('[VotingRoom] currentUser check', {
      currentUserId: currentUser.id,
      currentUserName: currentUser.name,
      userInRoom: !!userInRoom,
      roomUserIds: room.users.map(u => u.id),
      roomUserNames: room.users.map(u => u.name)
    });
  }, [room.users, currentUser.id, currentUser.name]);

  const allUsersVoted = room.users.every(user => user.hasVoted);
  const isAdmin = currentUser.isAdmin;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="glass rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-purple-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">Mood Voting Session</h1>
              <p className="text-purple-600 text-sm sm:text-base mt-1">Room: <span className="font-mono font-bold">{room.id}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-purple-300">
                    👑 Admin
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Member List */}
          <div className="mb-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl p-4 sm:p-5 border-2 border-purple-100">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-800">Room Members ({room.users.length})</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {room.users.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center space-x-2 bg-white px-3 sm:px-4 py-2 rounded-xl shadow-md border-2 border-purple-200 hover:border-purple-400 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                  {user.hasVoted && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={onFinishSession}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Flag className="w-4 h-4" />
                <span className="text-sm sm:text-base">Finish Session</span>
              </button>
              
              {!room.isVotingOpen && !showResults && (
                <button
                  onClick={onRevealResults}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Reveal Results</span>
                </button>
              )}
              
              {showResults && (
                <button
                  onClick={onResetVoting}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm sm:text-base">New Round</span>
                </button>
              )}
            </div>
          )}

          {/* Status */}
          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-white rounded-2xl border-2 border-purple-200">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm sm:text-base text-purple-900 font-semibold">
                  {room.isVotingOpen 
                    ? `📊 Voting in progress (${room.users.filter(u => u.hasVoted).length}/${room.users.length} voted)`
                    : showResults 
                      ? '✅ Results revealed automatically'
                      : '⏳ Waiting for results'
                  }
                </span>
                {room.isVotingOpen && allUsersVoted && !showResults && (
                  <span className="text-sm text-green-600 font-bold animate-pulse bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    🎉 All votes received! Auto-revealing...
                  </span>
                )}
              </div>
              {room.isVotingOpen && !showResults && (
                <div className="text-xs sm:text-sm text-purple-700 bg-purple-100 px-4 py-3 rounded-xl border border-purple-200">
                  <div className="flex items-start space-x-2">
                    <span>💡</span>
                    <div>
                      <p className="font-semibold">Anyone can join at any time using room code <span className="font-mono font-bold text-purple-900">{room.id}</span></p>
                      <p className="mt-1">⚡ Cards will auto-flip when everyone votes!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voting Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
          {room.users.map((user) => (
            <MoodCard
              key={user.id}
              userId={user.id}
              userName={user.name}
              hasVoted={user.hasVoted}
              vote={user.vote}
              showResults={showResults}
              isCurrentUser={user.id === currentUser.id}
              onVote={user.id === currentUser.id ? onVote : undefined}
            />
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {showResults && (
        <div className="max-w-7xl mx-auto mt-6 sm:mt-8">
          <div className="glass rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-purple-200">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-6">📊 Mood Recap</h2>
            <div className="max-h-96 overflow-auto space-y-3">
              {room.users.map(u => (
                <div key={u.id} className="py-3 px-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-purple-900 font-bold text-sm sm:text-base">{u.name}</span>
                  </div>
                  <div className="text-lg sm:text-xl">
                    {u.vote ? (
                      <span className="font-bold bg-white px-3 py-2 rounded-lg border-2 border-purple-200">{u.vote.emoji} <span className="text-purple-700">{u.vote.scale}/10</span></span>
                    ) : (
                      <span className="text-gray-400 text-sm">No vote</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
