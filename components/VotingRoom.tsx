'use client';

import { useState, useEffect } from 'react';
import { Users, Eye, EyeOff, RotateCcw } from 'lucide-react';
import MoodCard from './MoodCard';
import { Room, User, Vote } from '@/lib/types';

interface VotingRoomProps {
  room: Room;
  currentUser: User;
  onCloseVoting: () => void;
  onRevealResults: () => void;
  onResetVoting: () => void;
  onVote: (vote: Vote) => void;
}

export default function VotingRoom({ 
  room, 
  currentUser, 
  onCloseVoting, 
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
              {room.isVotingOpen && (
                <button
                  onClick={onCloseVoting}
                  disabled={!allUsersVoted}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Close Voting</span>
                </button>
              )}
              
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
                    : 'Voting closed - waiting for results'
                }
              </span>
              {room.isVotingOpen && allUsersVoted && (
                <span className="text-sm text-green-600 font-medium">
                  All votes received! Ready to close.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voting Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mood Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Score */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Average Mood Score</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {room.users.length > 0 
                    ? (room.users.reduce((sum, user) => sum + (user.vote?.scale || 0), 0) / room.users.length).toFixed(1)
                    : '0'
                  }/10
                </div>
              </div>
              
              {/* Most Common Emoji */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">Most Common Mood</h3>
                <div className="text-3xl">
                  {(() => {
                    const emojiCounts = room.users.reduce((acc, user) => {
                      if (user.vote?.emoji) {
                        acc[user.vote.emoji] = (acc[user.vote.emoji] || 0) + 1;
                      }
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const mostCommon = Object.entries(emojiCounts).reduce((a, b) => 
                      emojiCounts[a[0]] > emojiCounts[b[0]] ? a : b, ['', 0]
                    );
                    
                    return mostCommon[0] || '😐';
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
