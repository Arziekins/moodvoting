'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from 'lucide-react';

interface CalendarViewProps {
  currentUser: { id: string; name: string };
  onSelectDate: (date: string) => void;
  onViewHistory: () => void;
  votedDates?: string[]; // Dates user has already voted on
}

export default function CalendarView({ currentUser, onSelectDate, onViewHistory, votedDates = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ day: null, date: null });
  }
  
  // Actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    calendarDays.push({ day, date: dateString });
  }
  
  // Check if date is today
  const isToday = (dateString: string | null) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };
  
  // Check if date has been voted on
  const hasVoted = (dateString: string | null) => {
    if (!dateString) return false;
    return votedDates.includes(dateString);
  };
  
  // Check if date is in the future
  const isFuture = (dateString: string | null) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateString);
    return checkDate > today;
  };

  // Check if date is weekend (Saturday = 6, Sunday = 0)
  const isWeekend = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        <div className="gradient-animated rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                Welcome back, {currentUser.name}! 👋
              </h1>
              <p className="text-white/90 text-base sm:text-lg font-semibold">
                Select a date to vote or view results
              </p>
            </div>
            <button
              onClick={onViewHistory}
              className="btn-kahoot kahoot-green flex items-center space-x-2 text-sm sm:text-base px-4 py-3"
            >
              <TrendingUp className="w-5 h-5" />
              <span>View History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-4xl mx-auto">
        <div className="liquid-glass rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-white/50">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goToPreviousMonth}
              className="p-3 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black gradient-text-kahoot">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                className="mt-2 text-sm font-bold text-purple-600 hover:text-purple-700 underline"
              >
                Go to Today
              </button>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-3 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-black text-gray-600 uppercase tracking-wide"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {calendarDays.map((item, index) => {
              if (item.day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const voted = hasVoted(item.date);
              const today = isToday(item.date);
              const future = isFuture(item.date);
              const weekend = isWeekend(item.date);
              const disabled = future || weekend;

              return (
                <button
                  key={item.date}
                  onClick={() => !disabled && item.date && onSelectDate(item.date)}
                  disabled={disabled}
                  className={`aspect-square rounded-2xl font-black text-base sm:text-lg transition-all duration-200 transform-gpu relative ${
                    disabled
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : today
                      ? 'kahoot-purple text-white ring-4 ring-purple-300 ring-offset-2 hover:scale-105 shadow-lg'
                      : voted
                      ? 'kahoot-green text-white hover:scale-105 shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400 hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  <span>{item.day}</span>
                  {voted && (
                    <div className="absolute top-1 right-1 text-xs">✓</div>
                  )}
                  {today && !voted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 kahoot-red rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center text-sm font-semibold">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 kahoot-purple rounded-lg"></div>
                <span className="text-gray-700">Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 kahoot-green rounded-lg"></div>
                <span className="text-gray-700">Voted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-lg"></div>
                <span className="text-gray-700">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                <span className="text-gray-700">Weekend/Future</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border-2 border-blue-100">
            <div className="flex items-start space-x-3">
              <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  📅 Pick any past or present date to vote or view results
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Green dates have your vote • Purple is today • Weekends disabled (working days only)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

