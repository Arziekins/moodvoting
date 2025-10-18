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

  const allUsersVoted = room.users.every(user => user.hasVoted);
  const isAdmin = currentUser.isAdmin;

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mood Voting Session</h1>
              <p className="text-gray-600">Room: {room.id}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{room.users.length} participants</span>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Admin
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onFinishSession}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Flag className="w-4 h-4" />
                <span>Finish Session</span>
              </button>
              
              {!room.isVotingOpen && !showResults && (
                <button
                  onClick={onRevealResults}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Results</span>
                </button>
              )}
              
              {showResults && (
                <button
                  onClick={onResetVoting}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Round</span>
                </button>
              )}
            </div>
          )}

          {/* Status */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {room.isVotingOpen 
                  ? `Voting in progress (${room.users.filter(u => u.hasVoted).length}/${room.users.length} voted)`
                  : showResults 
                    ? 'Results revealed'
                    : 'Waiting for results'
                }
              </span>
              {room.isVotingOpen && allUsersVoted && (
                <span className="text-sm text-green-600 font-medium">
                  All votes received! You can reveal or finish.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voting Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Emote Recap</h2>
            <div className="max-h-96 overflow-auto divide-y">
              {room.users.map(u => (
                <div key={u.id} className="py-2 flex items-center justify-between">
                  <div className="text-gray-800 font-medium">{u.name}</div>
                  <div className="text-lg">
                    {u.vote ? (
                      <span className="font-bold">{u.vote.emoji} {u.vote.scale}/10</span>
                    ) : (
                      <span className="text-gray-400">No vote</span>
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
