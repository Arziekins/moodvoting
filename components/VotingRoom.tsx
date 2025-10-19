'use client';

import { useState, useEffect } from 'react';
import { Users, Eye, RotateCcw, Flag, TrendingUp, Award, Zap } from 'lucide-react';
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
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowResults(room.showResults);
    // Trigger confetti when results are revealed
    if (room.showResults && !showResults) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [room.showResults, showResults]);
  
  // Debug log
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
  const votedCount = room.users.filter(u => u.hasVoted).length;
  const totalUsers = room.users.length;
  const voteProgress = (votedCount / totalUsers) * 100;
  const isAdmin = currentUser.isAdmin;

  // Calculate average mood for results
  const averageMood = showResults && room.users.length > 0
    ? room.users.reduce((sum, u) => sum + (u.vote?.scale || 0), 0) / room.users.filter(u => u.vote).length
    : 0;

  return (
    <div className="min-h-screen relative">
      {/* Confetti effect (visual only) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                backgroundColor: ['#E21B3C', '#1368CE', '#FFA602', '#26890C', '#7B3FF2'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                borderRadius: '50%',
              }}
            />
          ))}
        </div>
      )}

      {/* Header Section */}
      <div className="gradient-animated p-6 sm:p-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Mood Check Session 🎉
              </h1>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white font-black text-sm sm:text-base">
                    Room: <span className="font-mono tracking-wider">{room.id}</span>
                  </span>
                </div>
                {isAdmin && (
                  <div className="bg-yellow-400 px-4 py-2 rounded-full flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-900" />
                    <span className="text-yellow-900 font-black text-sm uppercase">Admin</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onFinishSession}
                  className="btn-kahoot kahoot-red flex items-center space-x-2 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                >
                  <Flag className="w-4 h-4" />
                  <span>Finish</span>
                </button>
                
                {!room.isVotingOpen && !showResults && (
                  <button
                    onClick={onRevealResults}
                    className="btn-kahoot kahoot-green flex items-center space-x-2 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal</span>
                  </button>
                )}
                
                {showResults && (
                  <button
                    onClick={onResetVoting}
                    className="btn-kahoot kahoot-purple flex items-center space-x-2 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>New Round</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {room.isVotingOpen && !showResults && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-black text-sm uppercase tracking-wide">
                  Voting Progress
                </span>
                <span className="text-white font-black text-lg">
                  {votedCount}/{totalUsers}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${voteProgress}%` }}
                ></div>
              </div>
              {allUsersVoted && (
                <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center space-x-3 animate-pulse">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-white font-black text-sm">
                    🎉 Everyone voted! Auto-revealing results...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Status Banner */}
        <div className="mb-6 sm:mb-8">
          {room.isVotingOpen && !showResults ? (
            <div className="liquid-glass rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg sm:text-xl font-black text-gray-800">
                    📊 Voting in Progress
                  </span>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-xl border-2 border-blue-200">
                  <p className="text-sm font-bold text-blue-800">
                    💡 Cards will flip automatically when everyone votes!
                  </p>
                </div>
              </div>
            </div>
          ) : showResults ? (
            <div className="liquid-glass rounded-2xl p-4 sm:p-6 border-2 border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-green-600" />
                  <span className="text-lg sm:text-xl font-black text-gray-800">
                    ✅ Results Revealed!
                  </span>
                </div>
                <div className="bg-green-50 px-4 py-3 rounded-xl border-2 border-green-200">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-black text-green-800">
                      Team Average: <span className="text-lg">{averageMood.toFixed(1)}/10</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="liquid-glass rounded-2xl p-4 sm:p-6 border-2 border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full pulse-slow"></div>
                <span className="text-lg sm:text-xl font-black text-gray-800">
                  ⏳ Waiting for Results
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Member List */}
        <div className="mb-6 sm:mb-8 liquid-glass rounded-2xl p-4 sm:p-6 border-2 border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">
              Team Members ({totalUsers})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {room.users.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl shadow-md border-2 transition-all ${
                  user.hasVoted 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm ${
                  user.hasVoted ? 'kahoot-green' : 'bg-gray-400'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-black text-gray-800">{user.name}</span>
                {user.hasVoted && (
                  <span className="text-green-600 font-black">✓</span>
                )}
                {user.id === currentUser.id && (
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-black">
                    YOU
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Voting Cards Grid */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-6 flex items-center space-x-3">
            <span className="text-3xl">🎴</span>
            <span>Mood Cards</span>
          </h2>
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
          <div className="liquid-glass rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-purple-300 fade-in-scale">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl sm:text-3xl font-black gradient-text-kahoot">
                Team Mood Summary
              </h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <div className="text-3xl font-black text-blue-900">{totalUsers}</div>
                  <div className="text-sm font-bold text-blue-700 uppercase">Participants</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border-2 border-green-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-3xl font-black text-green-900">{averageMood.toFixed(1)}</div>
                  <div className="text-sm font-bold text-green-700 uppercase">Avg Mood</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border-2 border-purple-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-3xl font-black text-purple-900">{votedCount}</div>
                  <div className="text-sm font-bold text-purple-700 uppercase">Total Votes</div>
                </div>
              </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {room.users
                .sort((a, b) => (b.vote?.scale || 0) - (a.vote?.scale || 0))
                .map((u, index) => (
                  <div 
                    key={u.id} 
                    className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-all flex items-center justify-between fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 kahoot-purple rounded-full flex items-center justify-center text-white text-sm font-black shadow-md">
                        #{index + 1}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-black shadow-md">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-gray-800 text-base sm:text-lg">{u.name}</div>
                        {u.id === currentUser.id && (
                          <span className="text-xs font-bold text-purple-600 uppercase">That&apos;s you!</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {u.vote ? (
                        <>
                          <div className="text-3xl sm:text-4xl">{u.vote.emoji}</div>
                          <div className="bg-white px-4 py-2 rounded-xl border-2 border-purple-200 shadow-sm">
                            <span className="text-2xl sm:text-3xl font-black text-purple-600">
                              {u.vote.scale}
                            </span>
                            <span className="text-sm text-gray-600 font-bold">/10</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm font-semibold">No vote</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
