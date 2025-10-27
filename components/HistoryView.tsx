'use client';

import { useState } from 'react';
import { ArrowLeft, TrendingUp, Calendar as CalendarIcon, Users } from 'lucide-react';
import { TEAM_MEMBERS, TeamMemberId, MoodHistory } from '@/lib/types';

interface HistoryViewProps {
  currentUser: { id: TeamMemberId; name: string };
  onBack: () => void;
  history: MoodHistory[]; // All mood history data
}

export default function HistoryView({ currentUser, onBack, history }: HistoryViewProps) {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = this week, -1 = last week, etc.

  // Get start and end of a week (Monday to Friday)
  const getWeekDates = (offset: number = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Monday as start
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff + (offset * 7));
    monday.setHours(0, 0, 0, 0);
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    
    return { monday, friday };
  };

  const { monday, friday } = getWeekDates(selectedWeekOffset);

  // Format date range
  const formatWeekRange = () => {
    const mondayStr = monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const fridayStr = friday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${mondayStr} - ${fridayStr}`;
  };

  // Get weekday names (Mon-Fri)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Get dates for the week
  const getWeekDaysArray = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDaysArray = getWeekDaysArray();

  // Filter history for current week
  const weekHistory = history.filter(h => {
    const date = new Date(h.date);
    return date >= monday && date <= friday;
  });

  // Organize data by team member and day
  const getMemberWeekData = (memberId: TeamMemberId) => {
    return weekDaysArray.map(dateStr => {
      const entry = weekHistory.find(h => h.teamMemberId === memberId && h.date === dateStr);
      return entry ? entry.vote : null;
    });
  };

  // Calculate stats for the week
  const calculateWeekStats = () => {
    if (weekHistory.length === 0) {
      return { average: 0, highest: 0, lowest: 0, totalVotes: 0 };
    }

    const scores = weekHistory.map(h => h.vote.scale);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return { average, highest, lowest, totalVotes: weekHistory.length };
  };

  const stats = calculateWeekStats();

  // Get team member info
  const getTeamMember = (id: TeamMemberId) => {
    return TEAM_MEMBERS.find(m => m.id === id);
  };

  // Get color for member
  const getMemberColor = (color: string) => {
    const colors: { [key: string]: string } = {
      red: '#E21B3C',
      blue: '#1368CE',
      yellow: '#FFA602',
      green: '#26890C',
      purple: '#7B3FF2',
    };
    return colors[color] || colors.purple;
  };

  // Format date for display
  const formatDayMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <div className="gradient-animated rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <span>Mood History Tim</span>
              </h1>
              <p className="text-white/90 text-base sm:text-lg font-semibold">
                Perbandingan mood semua anggota tim
              </p>
            </div>
            <button
              onClick={onBack}
              className="btn-kahoot kahoot-blue flex items-center space-x-2 text-sm sm:text-base px-4 py-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="liquid-glass rounded-2xl p-4 border-2 border-white/50 flex items-center justify-between">
          <button
            onClick={() => setSelectedWeekOffset(selectedWeekOffset - 1)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 font-bold text-gray-700 transition-all"
          >
            ← Minggu Lalu
          </button>
          
          <div className="text-center">
            <div className="font-black text-xl text-gray-800">{formatWeekRange()}</div>
            <div className="text-sm text-gray-600 font-semibold">
              {selectedWeekOffset === 0 ? 'Minggu Ini' : selectedWeekOffset === -1 ? 'Minggu Lalu' : `${Math.abs(selectedWeekOffset)} Minggu Lalu`}
            </div>
          </div>
          
          <button
            onClick={() => setSelectedWeekOffset(selectedWeekOffset + 1)}
            disabled={selectedWeekOffset >= 0}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 font-bold text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Minggu Depan →
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="liquid-glass rounded-2xl p-5 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-black text-blue-900">{stats.average.toFixed(1)}</div>
              <div className="text-sm font-bold text-blue-700 uppercase">Rata-rata</div>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border-2 border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-2">🔝</div>
              <div className="text-3xl font-black text-green-900">{stats.highest}/10</div>
              <div className="text-sm font-bold text-green-700 uppercase">Tertinggi</div>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border-2 border-red-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📉</div>
              <div className="text-3xl font-black text-red-900">{stats.lowest || 0}/10</div>
              <div className="text-sm font-bold text-red-700 uppercase">Terendah</div>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border-2 border-purple-200">
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-3xl font-black text-purple-900">{stats.totalVotes}</div>
              <div className="text-sm font-bold text-purple-700 uppercase">Total Vote</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Line Chart */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border-2 border-white/50">
          <h2 className="text-2xl font-black gradient-text-kahoot mb-6">Perbandingan Mood Mingguan</h2>
          
          {weekHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 font-semibold">Belum ada data untuk minggu ini</p>
            </div>
          ) : (
            <div>
              {/* Chart */}
              <div className="relative h-80 mb-8">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-bold text-gray-500 pr-2">
                  <span>10</span>
                  <span>8</span>
                  <span>6</span>
                  <span>4</span>
                  <span>2</span>
                  <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-8 h-full relative border-l-2 border-b-2 border-gray-300">
                  {/* Horizontal grid lines */}
                  {[0, 2, 4, 6, 8, 10].map((value) => (
                    <div
                      key={value}
                      className="absolute w-full border-t border-gray-200"
                      style={{ bottom: `${(value / 10) * 100}%` }}
                    ></div>
                  ))}

                  {/* Lines for each team member */}
                  {TEAM_MEMBERS.map((member) => {
                    const weekData = getMemberWeekData(member.id);
                    const color = getMemberColor(member.color);
                    
                    // Create SVG path
                    const points = weekData.map((vote, index) => {
                      if (!vote) return null;
                      const x = ((index + 0.5) / 5) * 100;
                      const y = 100 - (vote.scale / 10) * 100;
                      return { x, y, vote };
                    }).filter(p => p !== null);

                    if (points.length === 0) return null;

                    return (
                      <svg key={member.id} className="absolute inset-0 w-full h-full pointer-events-none">
                        {/* Line */}
                        {points.length > 1 && (
                          <polyline
                            points={points.map(p => `${p!.x}%,${p!.y}%`).join(' ')}
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                        
                        {/* Points with emojis */}
                        {points.map((point, idx) => (
                          <g key={idx}>
                            <circle
                              cx={`${point!.x}%`}
                              cy={`${point!.y}%`}
                              r="6"
                              fill={color}
                              stroke="white"
                              strokeWidth="2"
                            />
                          </g>
                        ))}
                      </svg>
                    );
                  })}

                  {/* Emoji labels at each point */}
                  {weekDaysArray.map((dateStr, dayIndex) => {
                    const dayVotes = weekHistory.filter(h => h.date === dateStr);
                    return (
                      <div
                        key={dateStr}
                        className="absolute"
                        style={{ left: `${((dayIndex + 0.5) / 5) * 100}%`, transform: 'translateX(-50%)' }}
                      >
                        {dayVotes.map((entry, idx) => {
                          const yPosition = 100 - (entry.vote.scale / 10) * 100;
                          return (
                            <div
                              key={`${entry.teamMemberId}-${idx}`}
                              className="absolute text-2xl"
                              style={{
                                bottom: `${yPosition}%`,
                                transform: 'translate(-50%, 50%)',
                                left: '50%'
                              }}
                              title={`${getTeamMember(entry.teamMemberId)?.name}: ${entry.vote.scale}/10`}
                            >
                              {entry.vote.emoji}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div className="ml-8 mt-2 flex justify-between text-xs font-bold text-gray-600">
                  {weekdays.map((day, index) => (
                    <div key={day} className="flex-1 text-center">
                      <div>{day}</div>
                      <div className="text-xs text-gray-400">{formatDayMonth(weekDaysArray[index])}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t-2 border-gray-200">
                {TEAM_MEMBERS.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: getMemberColor(member.color) }}
                    ></div>
                    <span className="text-sm font-bold text-gray-700">
                      {member.avatar} {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="max-w-6xl mx-auto">
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border-2 border-white/50">
          <h2 className="text-2xl font-black gradient-text-kahoot mb-6">Detail Harian</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-sm">Tim</th>
                  {weekdays.map((day, index) => (
                    <th key={day} className="text-center py-3 px-2 font-black text-gray-700 uppercase text-xs">
                      <div>{day}</div>
                      <div className="text-xs text-gray-400 font-normal">{formatDayMonth(weekDaysArray[index]).split(' ')[0]}</div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-black text-gray-700 uppercase text-sm">Rata²</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map((member) => {
                  const weekData = getMemberWeekData(member.id);
                  const validScores = weekData.filter(v => v !== null).map(v => v!.scale);
                  const memberAvg = validScores.length > 0
                    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
                    : 0;

                  return (
                    <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                            style={{ backgroundColor: getMemberColor(member.color) }}
                          >
                            {member.avatar}
                          </div>
                          <span className="font-bold text-gray-800">{member.name}</span>
                        </div>
                      </td>
                      {weekData.map((vote, index) => (
                        <td key={index} className="text-center py-3 px-2">
                          {vote ? (
                            <div className="flex flex-col items-center">
                              <div className="text-2xl mb-1">{vote.emoji}</div>
                              <div className="text-sm font-bold text-gray-700">{vote.scale}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">-</div>
                          )}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4">
                        <div className="inline-block bg-purple-100 px-3 py-1 rounded-lg">
                          <span className="font-black text-purple-700">{memberAvg > 0 ? memberAvg.toFixed(1) : '-'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
