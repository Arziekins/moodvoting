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
        <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg max-w-sm border-2 border-blue-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">How's your mood today?</h3>
            <p className="text-sm text-gray-600">Select an emoji and rate your mood from 1-10</p>
          </div>
          
          {/* Emoji Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose an emoji that represents your mood:</label>
            <div className="grid grid-cols-5 gap-3">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-3 text-3xl rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                    selectedEmoji === emoji 
                      ? 'border-blue-500 bg-blue-100 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {selectedEmoji && (
              <div className="mt-2 text-center">
                <span className="text-sm text-gray-600">Selected: </span>
                <span className="text-2xl">{selectedEmoji}</span>
              </div>
            )}
          </div>
          
          {/* Scale Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Rate your mood intensity (1-10):</label>
            <div className="flex justify-center space-x-2">
              {scales.map((scale) => (
                <button
                  key={scale}
                  onClick={() => setSelectedScale(scale)}
                  className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 hover:scale-110 ${
                    selectedScale === scale
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-blue-200 hover:text-blue-800'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>
            {selectedScale > 0 && (
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-600 mb-1">Selected rating:</div>
                <div className="text-2xl font-bold text-blue-600">{selectedScale}/10</div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleVote}
            disabled={!selectedEmoji || selectedScale === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {selectedEmoji && selectedScale > 0 ? `Submit ${selectedEmoji} ${selectedScale}/10` : 'Submit Vote'}
          </button>
        </div>
      )}
    </div>
  );
}
