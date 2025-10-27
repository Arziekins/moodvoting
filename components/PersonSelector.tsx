'use client';

import { useState } from 'react';
import { TEAM_MEMBERS, TeamMemberId } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface PersonSelectorProps {
  onSelectPerson: (memberId: TeamMemberId, memberName: string) => void;
}

export default function PersonSelector({ onSelectPerson }: PersonSelectorProps) {
  const [selectedId, setSelectedId] = useState<TeamMemberId | null>(null);

  const handleSelect = (memberId: TeamMemberId, memberName: string) => {
    setSelectedId(memberId);
    // Small delay for visual feedback before transitioning
    setTimeout(() => {
      onSelectPerson(memberId, memberName);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 kahoot-purple rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 kahoot-blue rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 kahoot-yellow rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-3xl fade-in-scale">
        <div className="liquid-glass rounded-3xl shadow-2xl p-8 sm:p-10 border-2 border-white/50">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block gradient-animated p-6 rounded-3xl mb-6 float">
              <span className="text-6xl">👋</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black gradient-text-kahoot mb-3 tracking-tight">
              Who are you?
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-semibold">
              Select your name to continue
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {TEAM_MEMBERS.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member.id, member.name)}
                className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 transform-gpu ${
                  selectedId === member.id
                    ? 'scale-95 ring-4 ring-offset-4 ring-purple-500'
                    : 'hover:scale-105 hover:shadow-2xl'
                } ${
                  member.color === 'red' ? 'kahoot-red' :
                  member.color === 'blue' ? 'kahoot-blue' :
                  member.color === 'yellow' ? 'kahoot-yellow' :
                  member.color === 'green' ? 'kahoot-green' :
                  'kahoot-purple'
                }`}
              >
                {/* Avatar */}
                <div className="text-center mb-4">
                  <div className="text-5xl sm:text-6xl mb-3 transform group-hover:scale-110 transition-transform">
                    {member.avatar}
                  </div>
                  <div className="text-white font-black text-xl sm:text-2xl tracking-tight">
                    {member.name}
                  </div>
                </div>

                {/* Arrow indicator on hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>

                {/* Selection indicator */}
                {selectedId === member.id && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <div className="text-6xl animate-bounce">✓</div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border-2 border-blue-100">
            <h3 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center space-x-2">
              <span className="text-xl">💡</span>
              <span>How it Works</span>
            </h3>
            <ul className="text-sm text-gray-700 space-y-2 font-semibold">
              <li className="flex items-start">
                <span className="text-lg mr-2">📅</span>
                <span>Pick a date on the calendar</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2">😊</span>
                <span>Vote with your emoji and mood (1-10)</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2">📊</span>
                <span>View team mood history and trends</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2">🎉</span>
                <span>See results when everyone has voted!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

