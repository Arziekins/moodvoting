'use client';

import { useState, useEffect } from 'react';
import MoodCard from './MoodCard';
import { Room, User, Vote } from '@/lib/types';

// Copy to clipboard helper
const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
};

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
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setShowResults(room.showResults);
  }, [room.showResults]);
  
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

  // Get shareable link
  const shareableLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/${room.id}` 
    : '';

  const handleCopyLink = () => {
    if (copyToClipboard(shareableLink)) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen apple-gradient-bg">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="apple-title mb-1">Mood Check</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="apple-badge-gray">
                  Room: <span className="font-mono font-semibold">{room.id}</span>
                </span>
                {isAdmin && (
                  <span className="apple-badge-purple">Admin</span>
                )}
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-apple-gray-100 hover:bg-apple-gray-200 rounded-full text-xs font-medium text-apple-gray-700 transition-colors"
                  title="Copy shareable link"
                >
                  {copiedLink ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 1H3C2.44772 1 2 1.44772 2 2V10C2 10.5523 2.44772 11 3 11H9C9.55228 11 10 10.5523 10 10V2C10 1.44772 9.55228 1 9 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 4H11C10.4477 4 10 4.44772 10 5V12C10 12.5523 9.55228 13 9 13H5C4.44772 13 4 12.4477 4 12V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Share Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                {!room.isVotingOpen && !showResults && (
                  <button
                    onClick={onRevealResults}
                    className="apple-button-primary text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                      <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Reveal Results
                  </button>
                )}
                
                {showResults && (
                  <button
                    onClick={onResetVoting}
                    className="apple-button-secondary text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                      <path d="M1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C5.5 15 3.5 13.5 2.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M1 11V8H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    New Round
                  </button>
                )}
                
                <button
                  onClick={onFinishSession}
                  className="apple-button-secondary text-sm text-red-600"
                >
                  End Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Status Section */}
        <div className="mb-6 sm:mb-8">
          {room.isVotingOpen && !showResults ? (
            <div className="apple-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <h2 className="apple-heading text-base">Voting in Progress</h2>
                    <p className="apple-caption mt-0.5">Waiting for everyone to vote</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="apple-caption">Progress</span>
                  <span className="text-lg font-semibold text-apple-gray-900">{votedCount}/{totalUsers}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="apple-progress">
                  <div 
                    className="apple-progress-fill"
                    style={{ width: `${voteProgress}%` }}
                  ></div>
                </div>
              </div>
              
              {allUsersVoted && (
                <div className="mt-4 bg-apple-purple-50 border border-apple-purple-200 rounded-xl px-4 py-3 flex items-center space-x-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10L8.5 12.5L14 7" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="10" cy="10" r="8" stroke="#8B5CF6" strokeWidth="2"/>
                  </svg>
                  <span className="text-sm font-medium text-apple-purple-800">
                    Everyone voted! Revealing results...
                  </span>
                </div>
              )}
            </div>
          ) : showResults ? (
            <div className="apple-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="apple-heading text-base">Results Revealed</h2>
                  <p className="apple-caption mt-0.5">Team mood check complete</p>
                </div>
                <div className="bg-apple-purple-50 px-4 py-2 rounded-xl">
                  <div className="text-sm text-apple-purple-600 font-medium">Average Mood</div>
                  <div className="text-2xl font-semibold text-apple-purple-900">{averageMood.toFixed(1)}/10</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="apple-card p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <h2 className="apple-heading text-base">Waiting for Results</h2>
                  <p className="apple-caption mt-0.5">Admin will reveal when ready</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="mb-6 sm:mb-8">
          <h2 className="apple-heading mb-4">Team Members ({totalUsers})</h2>
          <div className="apple-card p-4">
            <div className="flex flex-wrap gap-2">
              {room.users.map((user) => (
                <div 
                  key={user.id} 
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
                    user.hasVoted 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                    user.hasVoted ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-apple-gray-800">{user.name}</span>
                  {user.hasVoted && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8L7 11L12 5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {user.id === currentUser.id && (
                    <span className="apple-badge-purple text-xs">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood Cards */}
        <div className="mb-8">
          <h2 className="apple-heading mb-4">Mood Cards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
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
          <div className="apple-card p-6 sm:p-8">
            <h2 className="apple-title mb-6">Summary</h2>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-apple-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-semibold text-apple-gray-900 mb-1">{totalUsers}</div>
                <div className="apple-caption">Participants</div>
              </div>
              
              <div className="bg-apple-purple-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-semibold text-apple-purple-900 mb-1">{averageMood.toFixed(1)}</div>
                <div className="apple-caption text-apple-purple-700">Average Mood</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-semibold text-green-900 mb-1">{votedCount}</div>
                <div className="apple-caption text-green-700">Total Votes</div>
              </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-2">
              {room.users
                .sort((a, b) => (b.vote?.scale || 0) - (a.vote?.scale || 0))
                .map((u, index) => (
                  <div 
                    key={u.id} 
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-apple-purple-300 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 apple-gradient-purple rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 bg-apple-gray-800 rounded-full flex items-center justify-center text-white font-semibold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-apple-gray-900">{u.name}</div>
                        {u.id === currentUser.id && (
                          <span className="text-xs font-medium text-apple-purple-600">That&apos;s you!</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {u.vote ? (
                        <>
                          <div className="text-3xl">{u.vote.emoji}</div>
                          <div className="text-right">
                            <div className="text-2xl font-semibold text-apple-purple-600">{u.vote.scale}</div>
                            <div className="text-xs text-apple-gray-500">/10</div>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">No vote</span>
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
