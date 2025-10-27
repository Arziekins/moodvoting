'use client';

import { useState } from 'react';
import { ArrowLeft, TrendingUp, Calendar as CalendarIcon, User } from 'lucide-react';
import { TEAM_MEMBERS, TeamMemberId, MoodHistory } from '@/lib/types';

interface HistoryViewProps {
  currentUser: { id: TeamMemberId; name: string };
  onBack: () => void;
  history: MoodHistory[]; // All mood history data
}

export default function HistoryView({ currentUser, onBack, history }: HistoryViewProps) {
  const [viewMode, setViewMode] = useState<'personal' | 'team'>('personal');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  // Filter history based on mode and period
  const getFilteredHistory = () => {
    let filtered = viewMode === 'personal' 
      ? history.filter(h => h.teamMemberId === currentUser.id)
      : history;

    const now = new Date();
    const cutoffDate = new Date();
    
    if (selectedPeriod === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    if (selectedPeriod !== 'all') {
      filtered = filtered.filter(h => new Date(h.date) >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredHistory = getFilteredHistory();

  // Calculate stats
  const calculateStats = () => {
    if (filteredHistory.length === 0) {
      return { average: 0, highest: 0, lowest: 0, totalDays: 0 };
    }

    const scores = filteredHistory.map(h => h.vote.scale);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    // Count unique dates
    const uniqueDates = new Set(filteredHistory.map(h => h.date));
    const totalDays = uniqueDates.size;

    return { average, highest, lowest, totalDays };
  };

  const stats = calculateStats();

  // Get team member info
  const getTeamMember = (id: TeamMemberId) => {
    return TEAM_MEMBERS.find(m => m.id === id);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get mood label
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

  // Simple bar chart data (last 7 or 30 entries)
  const chartData = filteredHistory.slice(0, selectedPeriod === 'week' ? 7 : 30).reverse();

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <div className="gradient-animated rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <span>Mood History</span>
              </h1>
              <p className="text-white/90 text-base sm:text-lg font-semibold">
                Track your team&apos;s mood over time
              </p>
            </div>
            <button
              onClick={onBack}
              className="btn-kahoot kahoot-blue flex items-center space-x-2 text-sm sm:text-base px-4 py-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="liquid-glass rounded-2xl p-4 border-2 border-white/50 flex flex-wrap gap-4 justify-between items-center">
          {/* View Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('personal')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                viewMode === 'personal'
                  ? 'kahoot-purple text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              My Moods
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                viewMode === 'team'
                  ? 'kahoot-purple text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
              }`}
            >
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              Team Moods
            </button>
          </div>

          {/* Period Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                selectedPeriod === 'week'
                  ? 'kahoot-green text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                selectedPeriod === 'month'
                  ? 'kahoot-green text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                selectedPeriod === 'all'
                  ? 'kahoot-green text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="liquid-glass rounded-2xl p-5 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-black text-blue-900">{stats.average.toFixed(1)}</div>
              <div className="text-sm font-bold text-blue-700 uppercase">Avg Mood</div>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border-2 border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-2">🔝</div>
              <div className="text-3xl font-black text-green-900">{stats.highest}/10</div>
              <div className="text-sm font-bold text-green-700 uppercase">Highest</div>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border-2 border-red-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📉</div>
              <div className="text-3xl font-black text-red-900">{stats.lowest}/10</div>
              <div className="text-sm font-bold text-red-700 uppercase">Lowest</div>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border-2 border-purple-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <div className="text-3xl font-black text-purple-900">{stats.totalDays}</div>
              <div className="text-sm font-bold text-purple-700 uppercase">Days Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      {chartData.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 border-2 border-white/50">
            <h2 className="text-2xl font-black gradient-text-kahoot mb-6">Mood Trend</h2>
            <div className="flex items-end justify-between space-x-2 h-64">
              {chartData.map((entry, index) => {
                const heightPercent = (entry.vote.scale / 10) * 100;
                const member = getTeamMember(entry.teamMemberId);
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-xl transition-all hover:opacity-80 cursor-pointer ${
                          member?.color === 'red' ? 'kahoot-red' :
                          member?.color === 'blue' ? 'kahoot-blue' :
                          member?.color === 'yellow' ? 'kahoot-yellow' :
                          member?.color === 'green' ? 'kahoot-green' :
                          'kahoot-purple'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${formatDate(entry.date)}: ${entry.vote.emoji} ${entry.vote.scale}/10`}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl">
                          {entry.vote.emoji}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-600 text-center">
                      {new Date(entry.date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between text-xs font-bold text-gray-500">
              <span>0</span>
              <span>Mood Scale</span>
              <span>10</span>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="max-w-6xl mx-auto">
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border-2 border-white/50">
          <h2 className="text-2xl font-black gradient-text-kahoot mb-6">Recent Entries</h2>
          
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 font-semibold">No mood data yet</p>
              <p className="text-sm text-gray-500 mt-2">Start voting to see your history!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHistory.map((entry, index) => {
                const member = getTeamMember(entry.teamMemberId);
                
                return (
                  <div
                    key={`${entry.date}-${entry.teamMemberId}-${index}`}
                    className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-all flex items-center justify-between fade-in"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black shadow-md ${
                        member?.color === 'red' ? 'kahoot-red' :
                        member?.color === 'blue' ? 'kahoot-blue' :
                        member?.color === 'yellow' ? 'kahoot-yellow' :
                        member?.color === 'green' ? 'kahoot-green' :
                        'kahoot-purple'
                      }`}>
                        {member?.avatar}
                      </div>
                      <div>
                        <div className="font-black text-gray-800 text-lg">{member?.name}</div>
                        <div className="text-sm text-gray-600 font-semibold">{formatDate(entry.date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{entry.vote.emoji}</div>
                      <div className="bg-white px-4 py-2 rounded-xl border-2 border-purple-200 shadow-sm text-center">
                        <div className="text-2xl font-black text-purple-600">{entry.vote.scale}</div>
                        <div className="text-xs text-gray-600 font-bold">{getMoodLabel(entry.vote.scale)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

