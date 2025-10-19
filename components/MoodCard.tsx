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
  return 'Excellent';
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
        className={`mood-card ${isCurrentUser ? 'ring-2 ring-apple-purple-500 ring-offset-2' : ''}`}
        onClick={handleCardClick}
      >
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Card Front (Cover) */}
          <div className="card-front card-cover">
            {hasVoted ? (
              <div className="flex flex-col items-center text-white">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                  <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="3"/>
                  <path d="M16 24L21 29L32 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium opacity-90">Voted</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-white opacity-60">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 animate-pulse">
                  <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="3" strokeDasharray="4 4"/>
                </svg>
                <span className="text-xs font-medium">Waiting</span>
              </div>
            )}
          </div>
          
          {/* Card Back (Content) */}
          <div className="card-back card-content">
            {showResults && vote ? (
              <div className="text-center h-full flex flex-col items-center justify-center p-4">
                <div className="text-5xl mb-3">{vote.emoji}</div>
                <div className="text-3xl font-semibold text-apple-gray-900 mb-1">
                  {vote.scale}
                </div>
                <div className="text-xs font-medium text-apple-gray-500">
                  {getMoodLabel(vote.scale)}
                </div>
              </div>
            ) : (
              <div className="text-center h-full flex flex-col items-center justify-center p-4">
                <div className="text-sm font-medium text-apple-gray-600 mb-2">{userName}</div>
                <div className="text-2xl mb-2">{hasVoted ? '✓' : '⏳'}</div>
                <div className="text-xs text-apple-gray-400">
                  {hasVoted ? 'Voted' : 'Waiting'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Name Label */}
      <div className="text-center">
        <div className="text-sm font-medium text-apple-gray-800">
          {userName}
        </div>
        {isCurrentUser && (
          <div className="inline-block apple-badge-purple text-xs mt-1">
            You
          </div>
        )}
      </div>
      
      {/* Voting Interface for Current User */}
      {isCurrentUser && !hasVoted && onVote && (
        <div className="fixed inset-0 apple-overlay flex items-center justify-center p-4 z-50 fade-in">
          <div className="apple-card max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto scale-in">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 apple-gradient-purple rounded-2xl mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2.5"/>
                  <circle cx="12" cy="14" r="1.5" fill="white"/>
                  <circle cx="20" cy="14" r="1.5" fill="white"/>
                  <path d="M12 20C12 20 13.5 22 16 22C18.5 22 20 20 20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="apple-title mb-2">How's Your Mood?</h3>
              <p className="apple-caption">
                Pick an emoji and rate your mood from 1 to 10
              </p>
            </div>
            
            {/* Emoji Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-apple-gray-700 mb-2">
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
                className={`apple-input text-4xl text-center ${
                  selectedEmoji
                    ? 'ring-2 ring-green-500 border-green-500'
                    : emojiInput
                      ? 'ring-2 ring-red-500 border-red-500'
                      : ''
                }`}
                maxLength={8}
              />
              <div className="mt-2 text-center min-h-[24px]">
                {emojiError ? (
                  <span className="text-sm text-red-600">{emojiError}</span>
                ) : selectedEmoji ? (
                  <span className="text-sm text-green-600 flex items-center justify-center space-x-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Perfect!</span>
                  </span>
                ) : (
                  <span className="text-xs text-apple-gray-400">Use your emoji keyboard</span>
                )}
              </div>
            </div>
            
            {/* Scale Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-apple-gray-700 mb-4">
                Rate Your Mood
              </label>
              
              {/* Slider */}
              <div className="px-1">
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
                  className="apple-slider"
                  style={{
                    background: `linear-gradient(to right, 
                      #EF4444 0%, 
                      #F59E0B ${((selectedScale - 1) / 9) * 50}%, 
                      #10B981 ${((selectedScale - 1) / 9) * 100}%)`
                  }}
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
                      className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                        selectedScale === num
                          ? 'bg-apple-purple-600 text-white scale-110 shadow-apple-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Current Selection Display */}
              <div className={`mt-5 rounded-xl p-5 transition-all ${
                hasInteractedWithSlider 
                  ? 'bg-apple-purple-50 border border-apple-purple-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-center">
                  <div className="text-5xl mb-2">{getMoodEmoji(selectedScale)}</div>
                  <div className="text-4xl font-semibold text-apple-purple-600 mb-1">
                    {selectedScale}/10
                  </div>
                  <div className="inline-block bg-white px-3 py-1.5 rounded-lg border border-apple-purple-200 text-sm font-medium text-apple-gray-700">
                    {getMoodLabel(selectedScale)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleVote}
              disabled={!selectedEmoji || !hasInteractedWithSlider}
              className={`w-full apple-button-primary ${
                (!selectedEmoji || !hasInteractedWithSlider) ? 'opacity-40' : ''
              }`}
            >
              {selectedEmoji && hasInteractedWithSlider 
                ? `Submit ${selectedEmoji} ${selectedScale}/10` 
                : 'Choose emoji & rating'}
            </button>

            {/* Tip */}
            {(!selectedEmoji || !hasInteractedWithSlider) && (
              <p className="mt-4 text-xs text-center text-apple-gray-400">
                {!selectedEmoji && !hasInteractedWithSlider && 'Pick an emoji and slide to rate'}
                {!selectedEmoji && hasInteractedWithSlider && 'Pick an emoji to continue'}
                {selectedEmoji && !hasInteractedWithSlider && 'Slide to rate your mood'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
