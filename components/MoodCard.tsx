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
  
  // Debug log
  useEffect(() => {
    console.log('[MoodCard] Props', {
      userId,
      userName,
      hasVoted,
      isCurrentUser,
      onVote: !!onVote,
      canVote: isCurrentUser && !hasVoted && !!onVote
    });
  }, [userId, userName, hasVoted, isCurrentUser, onVote]);
  
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
      
      <div className="text-xs text-purple-900 text-center max-w-28 font-semibold">
        {userName}
        {isCurrentUser && <span className="block text-purple-600 font-bold">(You)</span>}
      </div>
      
      {/* Voting Interface for Current User */}
      {isCurrentUser && !hasVoted && onVote && (
        <div className="mt-4 p-6 sm:p-8 glass rounded-3xl shadow-2xl max-w-full sm:max-w-sm md:max-w-md border-2 border-purple-300">
          <div className="text-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">How&apos;s your mood today?</h3>
            <p className="text-sm sm:text-base text-purple-700">Choose an emoji and slide to rate from 1 (very bad) to 10 (excellent)</p>
          </div>
          
          {/* Emoji Input (mobile-friendly) */}
          <div className="mb-6">
            <label className="block text-sm sm:text-base font-bold text-purple-800 mb-3">Enter any emoji that represents your mood:</label>
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="e.g. 😊, 😤, 🤔, 🧠"
              value={emojiInput}
              onChange={(e) => onEmojiChange(e.target.value)}
              className={`w-full px-4 py-4 rounded-2xl border-2 text-3xl text-center bg-white shadow-inner ${
                selectedEmoji
                  ? 'border-purple-500 ring-2 ring-purple-200'
                  : emojiInput
                    ? 'border-red-400'
                    : 'border-purple-200'
              }`}
              maxLength={8}
            />
            <div className="mt-3 text-center min-h-[24px]">
              {emojiError ? (
                <span className="text-xs sm:text-sm text-red-600 font-semibold">{emojiError}</span>
              ) : selectedEmoji ? (
                <span className="text-sm sm:text-base text-purple-800 font-semibold">Selected: <span className="text-3xl align-middle">{selectedEmoji}</span></span>
              ) : (
                <span className="text-xs sm:text-sm text-purple-600">💡 Tip: Use your mobile emoji keyboard</span>
              )}
            </div>
          </div>
          
          {/* Scale Selection - Slider */}
          <div className="mb-6">
            <label className="block text-sm sm:text-base font-bold text-purple-800 mb-4">Rate your mood:</label>
            
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
                className="w-full h-4 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full appearance-none cursor-pointer mood-slider shadow-inner"
              />
              
              {/* Labels */}
              <div className="flex justify-between mt-3 px-1">
                <span className="text-xs sm:text-sm text-red-600 font-bold">😢 Very Bad</span>
                <span className="text-xs sm:text-sm text-green-600 font-bold">🥳 Excellent</span>
              </div>
              
              {/* Scale markers */}
              <div className="flex justify-between mt-2 px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <span key={num} className="text-xs text-purple-400 font-semibold w-6 text-center">{num}</span>
                ))}
              </div>
            </div>
            
            {/* Current Selection Display */}
            <div className={`mt-5 text-center bg-gradient-to-br from-purple-50 to-white rounded-2xl p-4 sm:p-5 border-2 shadow-md ${hasInteractedWithSlider ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-200'}`}>
              <div className="text-xs sm:text-sm text-purple-700 font-semibold mb-2">{hasInteractedWithSlider ? 'Your rating:' : '👆 Move slider to rate'}</div>
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">{selectedScale}<span className="text-2xl">/10</span></div>
              <div className="text-sm sm:text-base text-purple-600 font-bold bg-white px-3 py-2 rounded-lg inline-block border border-purple-200">
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
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-base sm:text-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-2xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {selectedEmoji && hasInteractedWithSlider ? `Submit ${selectedEmoji} ${selectedScale}/10` : 'Submit Vote'}
          </button>
        </div>
      )}
    </div>
  );
}
