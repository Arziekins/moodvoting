'use client';

import { useState, useEffect } from 'react';
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
  const [emojiInput, setEmojiInput] = useState('');
  const [emojiError, setEmojiError] = useState('');
  const [selectedScale, setSelectedScale] = useState(5); // Default to middle value
  const [hasInteractedWithSlider, setHasInteractedWithSlider] = useState(false);
  
  // Auto-flip when results are revealed
  useEffect(() => {
    if (showResults && !isFlipped) {
      // Add a small delay for dramatic effect
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showResults, isFlipped]);

  const isSingleEmoji = (value: string) => {
    const text = value.trim();
    if (!text) return false;
    // Use code point splitting to count graphemes (approx) for mobile input
    const codePoints = Array.from(text);
    if (codePoints.length !== 1) return false;
    // Basic emoji detection without Unicode property escapes or 'u' flag
    // 1) Misc symbols & dingbats range
    if (/[\u2600-\u27BF]/.test(text)) return true;
    // 2) Surrogate pair ranges commonly used by emoji
    if (/[\uD83C-\uDBFF][\uDC00-\uDFFF]/.test(text)) return true;
    return false;
  };

  const onEmojiChange = (value: string) => {
    setEmojiInput(value);
    if (!value.trim()) {
      setEmojiError('');
      setSelectedEmoji('');
      return;
    }
    if (isSingleEmoji(value)) {
      setSelectedEmoji(value.trim());
      setEmojiError('');
    } else {
      setSelectedEmoji('');
      setEmojiError('Please enter a single emoji only');
    }
  };

  const handleVote = () => {
    if (selectedEmoji && hasInteractedWithSlider && onVote) {
      console.log('[vote] submit', { selectedEmoji, selectedScale, hasInteractedWithSlider });
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
      {isCurrentUser && !hasVoted && onVote && (
        <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg max-w-full sm:max-w-sm md:max-w-md border-2 border-blue-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">How&apos;s your mood today?</h3>
            <p className="text-sm text-gray-600">Choose an emoji and slide to rate from 1 (very bad) to 10 (excellent)</p>
          </div>
          
          {/* Emoji Input (mobile-friendly) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Enter any emoji that represents your mood:</label>
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="e.g. 😊, 😤, 🤔, 🧠"
              value={emojiInput}
              onChange={(e) => onEmojiChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 text-2xl text-center bg-white ${
                selectedEmoji
                  ? 'border-blue-500'
                  : emojiInput
                    ? 'border-red-300'
                    : 'border-gray-200'
              }`}
              maxLength={8}
            />
            <div className="mt-2 text-center min-h-[20px]">
              {emojiError ? (
                <span className="text-xs text-red-600">{emojiError}</span>
              ) : selectedEmoji ? (
                <span className="text-sm text-gray-700">Selected: <span className="text-2xl align-middle">{selectedEmoji}</span></span>
              ) : (
                <span className="text-xs text-gray-500">Tip: Use your mobile emoji keyboard</span>
              )}
            </div>
          </div>
          
          {/* Scale Selection - Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Rate your mood:</label>
            
            {/* Slider */}
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="10"
                value={selectedScale}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  console.log('[scale] slider change', { value });
                  setSelectedScale(value);
                  setHasInteractedWithSlider(true);
                }}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer mood-slider"
              />
              
              {/* Labels */}
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-red-600 font-medium">Very Bad</span>
                <span className="text-xs text-green-600 font-medium">Excellent</span>
              </div>
              
              {/* Scale markers */}
              <div className="flex justify-between mt-1 px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <span key={num} className="text-xs text-gray-400 w-6 text-center">{num}</span>
                ))}
              </div>
            </div>
            
            {/* Current Selection Display */}
            <div className={`mt-4 text-center bg-white rounded-lg p-3 border-2 ${hasInteractedWithSlider ? 'border-blue-500' : 'border-gray-200'}`}>
              <div className="text-sm text-gray-600 mb-1">{hasInteractedWithSlider ? 'Your rating:' : 'Move slider to rate:'}</div>
              <div className="text-3xl font-bold text-blue-600">{selectedScale}/10</div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedScale <= 3 && '😢 Very Bad'}
                {selectedScale === 4 && '😔 Bad'}
                {selectedScale === 5 && '😐 Neutral'}
                {selectedScale === 6 && '🙂 Okay'}
                {selectedScale === 7 && '😊 Good'}
                {selectedScale === 8 && '😄 Great'}
                {selectedScale === 9 && '🤩 Amazing'}
                {selectedScale === 10 && '🥳 Excellent'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleVote}
            disabled={!selectedEmoji || !hasInteractedWithSlider}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold text-base sm:text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {selectedEmoji && hasInteractedWithSlider ? `Submit ${selectedEmoji} ${selectedScale}/10` : 'Submit Vote'}
          </button>
        </div>
      )}
    </div>
  );
}
