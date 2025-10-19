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

// Assign colors based on user position/id for visual variety
const getCardColor = (userId: string, hasVoted: boolean) => {
  const colors = ['red', 'blue', 'yellow', 'green', 'purple'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hasVoted ? colors[hash % colors.length] : 'purple';
};

const getMoodEmoji = (scale: number) => {
  if (scale <= 2) return '😢';
  if (scale <= 4) return '😔';
  if (scale === 5) return '😐';
  if (scale === 6) return '🙂';
  if (scale === 7) return '😊';
  if (scale === 8) return '😄';
  if (scale === 9) return '🤩';
  return '🥳';
};

const getMoodLabel = (scale: number) => {
  if (scale <= 2) return 'Very Bad';
  if (scale <= 4) return 'Bad';
  if (scale === 5) return 'Neutral';
  if (scale === 6) return 'Okay';
  if (scale === 7) return 'Good';
  if (scale === 8) return 'Great';
  if (scale === 9) return 'Amazing';
  return 'Excellent!';
};

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
  const [selectedScale, setSelectedScale] = useState(5);
  const [hasInteractedWithSlider, setHasInteractedWithSlider] = useState(false);
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  
  const cardColor = getCardColor(userId, hasVoted);
  
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
  
  // Auto-flip when results are revealed with staggered animation
  useEffect(() => {
    if (showResults && !isFlipped) {
      // Stagger based on position for dramatic effect
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const delay = (hash % 10) * 100 + 200;
      
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [showResults, isFlipped, userId]);

  const isSingleEmoji = (value: string) => {
    const text = value.trim();
    if (!text) return false;
    const codePoints = Array.from(text);
    if (codePoints.length !== 1) return false;
    if (/[\u2600-\u27BF]/.test(text)) return true;
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
      setShowVoteSuccess(true);
      setTimeout(() => setShowVoteSuccess(false), 3000);
    }
  };

  const handleCardClick = () => {
    if (showResults && !isFlipped) {
      setIsFlipped(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 fade-in">
      {/* The Card */}
      <div 
        className={`mood-card ${isCurrentUser ? 'ring-4 ring-yellow-400 ring-offset-4' : ''} ${showVoteSuccess ? 'celebrate' : ''}`}
        onClick={handleCardClick}
      >
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Card Front (Cover) */}
          <div className={`card-front card-cover-${cardColor}`}>
            {hasVoted ? (
              <div className="flex flex-col items-center">
                <span className="text-6xl mb-2">✓</span>
                <span className="text-xs font-bold opacity-90">VOTED</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-6xl mb-2">?</span>
                <span className="text-xs font-bold opacity-90 pulse-slow">WAITING</span>
              </div>
            )}
          </div>
          
          {/* Card Back (Content) */}
          <div className="card-back card-content">
            {showResults && vote ? (
              <div className="text-center h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-3 animate-bounce">{vote.emoji}</div>
                <div className="text-3xl font-black text-gray-800 mb-2">
                  {vote.scale}<span className="text-xl">/10</span>
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {getMoodLabel(vote.scale)}
                </div>
              </div>
            ) : (
              <div className="text-center h-full flex flex-col items-center justify-center">
                <div className="text-sm font-bold text-gray-600 mb-2">{userName}</div>
                <div className="text-3xl mb-2">{hasVoted ? '✅' : '⏳'}</div>
                <div className="text-xs text-gray-500 font-semibold">
                  {hasVoted ? 'Voted!' : 'Waiting...'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Name Label */}
      <div className="text-center">
        <div className="text-sm font-black text-gray-800">
          {userName}
        </div>
        {isCurrentUser && (
          <div className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black uppercase mt-1">
            You
          </div>
        )}
      </div>
      
      {/* Voting Interface for Current User */}
      {isCurrentUser && !hasVoted && onVote && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
          <div className="liquid-glass rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-white/50 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-block gradient-animated p-4 rounded-2xl mb-4">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black gradient-text-kahoot mb-2">
                How&apos;s Your Mood?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 font-semibold">
                Pick an emoji and rate 1 (bad) to 10 (excellent)
              </p>
            </div>
            
            {/* Emoji Input */}
            <div className="mb-6">
              <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
                Choose Your Emoji
              </label>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="😊"
                value={emojiInput}
                onChange={(e) => onEmojiChange(e.target.value)}
                className={`w-full px-5 py-5 rounded-2xl border-3 text-5xl text-center bg-white shadow-lg transition-all ${
                  selectedEmoji
                    ? 'border-green-400 ring-4 ring-green-200'
                    : emojiInput
                      ? 'border-red-400 ring-4 ring-red-200'
                      : 'border-gray-200'
                }`}
                maxLength={8}
              />
              <div className="mt-3 text-center min-h-[28px]">
                {emojiError ? (
                  <span className="text-sm text-red-600 font-bold">{emojiError}</span>
                ) : selectedEmoji ? (
                  <span className="text-sm text-green-600 font-bold flex items-center justify-center space-x-2">
                    <span>✓</span>
                    <span>Perfect!</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-semibold">💡 Use your emoji keyboard</span>
                )}
              </div>
            </div>
            
            {/* Scale Selection */}
            <div className="mb-6">
              <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wide">
                Rate Your Mood
              </label>
              
              {/* Slider */}
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedScale}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setSelectedScale(value);
                    setHasInteractedWithSlider(true);
                  }}
                  className="w-full mood-slider bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 shadow-inner"
                />
                
                {/* Scale Numbers */}
                <div className="flex justify-between mt-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setSelectedScale(num);
                        setHasInteractedWithSlider(true);
                      }}
                      className={`w-8 h-8 rounded-full text-xs font-black transition-all ${
                        selectedScale === num
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-125 shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Current Selection Display */}
              <div className={`mt-5 rounded-2xl p-5 border-3 shadow-md transition-all ${
                hasInteractedWithSlider 
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-center">
                  <div className="text-5xl mb-2">{getMoodEmoji(selectedScale)}</div>
                  <div className="text-4xl font-black gradient-text-kahoot mb-2">
                    {selectedScale}<span className="text-xl">/10</span>
                  </div>
                  <div className="inline-block bg-white px-4 py-2 rounded-xl border-2 border-purple-200 font-black text-sm text-gray-700 uppercase">
                    {getMoodLabel(selectedScale)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleVote}
              disabled={!selectedEmoji || !hasInteractedWithSlider}
              className={`w-full btn-kahoot flex items-center justify-center space-x-3 ${
                selectedEmoji && hasInteractedWithSlider ? 'kahoot-green' : 'bg-gray-300'
              }`}
            >
              <span className="text-2xl">
                {selectedEmoji && hasInteractedWithSlider ? '🎉' : '⏳'}
              </span>
              <span>
                {selectedEmoji && hasInteractedWithSlider 
                  ? `Submit ${selectedEmoji} ${selectedScale}/10` 
                  : 'Choose emoji & rating'}
              </span>
            </button>

            {/* Tip */}
            {(!selectedEmoji || !hasInteractedWithSlider) && (
              <p className="mt-4 text-xs text-center text-gray-500 font-semibold">
                {!selectedEmoji && !hasInteractedWithSlider && '👆 Pick an emoji and slide to rate'}
                {!selectedEmoji && hasInteractedWithSlider && '👆 Pick an emoji to continue'}
                {selectedEmoji && !hasInteractedWithSlider && '👆 Slide to rate your mood'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
