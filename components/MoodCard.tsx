'use client';

import { useState } from 'react';
import { Vote } from '@/lib/types';

interface MoodCardProps {
  userId: string;
  userName: string;
  hasVoted: boolean;
  vote?: Vote;
  showResults: boolean;
  isCurrentUser: boolean;
  onVote?: (vote: Vote) => void;
}

const emojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥳', '😍', '🤗'];
const scales = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MoodCard({ 
  userId, 
  userName, 
  hasVoted, 
  vote, 
  showResults, 
  isCurrentUser, 
  onVote 
}: MoodCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [selectedScale, setSelectedScale] = useState(0);

  const handleVote = () => {
    if (selectedEmoji && selectedScale > 0 && onVote) {
      onVote({ emoji: selectedEmoji, scale: selectedScale });
    }
  };

  const handleCardClick = () => {
    if (showResults && !isFlipped) {
      setIsFlipped(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div 
        className={`card ${isCurrentUser ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={handleCardClick}
      >
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Card Cover */}
          <div className="card-front card-cover">
            {hasVoted ? '✓' : '?'}
          </div>
          
          {/* Card Content */}
          <div className="card-back card-content">
            {showResults && vote ? (
              <div className="text-center">
                <div className="text-3xl mb-2">{vote.emoji}</div>
                <div className="text-lg font-bold text-gray-800">{vote.scale}/10</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">{userName}</div>
                <div className="text-xs text-gray-500">Voted</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-white text-center max-w-24">
        {userName}
        {isCurrentUser && <span className="block text-yellow-300">(You)</span>}
      </div>
      
      {/* Voting Interface for Current User */}
      {isCurrentUser && !hasVoted && !showResults && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg max-w-xs">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">How&apos;s your mood today?</h3>
          
          {/* Emoji Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose an emoji:</label>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-2 text-2xl rounded-lg border-2 transition-colors ${
                    selectedEmoji === emoji 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scale Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate your mood (1-10):</label>
            <div className="flex space-x-1">
              {scales.map((scale) => (
                <button
                  key={scale}
                  onClick={() => setSelectedScale(scale)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    selectedScale === scale
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleVote}
            disabled={!selectedEmoji || selectedScale === 0}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Submit Vote
          </button>
        </div>
      )}
    </div>
  );
}
