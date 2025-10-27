'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { Vote, TeamMemberId, MoodHistory, TEAM_MEMBERS } from '@/lib/types';
import PersonSelector from '@/components/PersonSelector';
import CalendarView from '@/components/CalendarView';
import VotingRoom from '@/components/VotingRoom';
import HistoryView from '@/components/HistoryView';

type AppState = 'person-select' | 'calendar' | 'voting' | 'history';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('person-select');
  const [currentUser, setCurrentUser] = useState<{ id: TeamMemberId; name: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [votedDates, setVotedDates] = useState<string[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodHistory[]>([]);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('room:created', (data: { roomId: string; date: string }) => {
      console.log('Date session created:', data);
      const newRoom = {
        id: data.roomId,
        name: `Session ${data.date}`,
        adminId: socketInstance.id || 'unknown',
        users: [],
        isVotingOpen: true,
        showResults: false,
        createdAt: new Date(),
        date: data.date,
      };
      setRoom(newRoom);
      setAppState('voting');
    });

    socketInstance.on('presence', (data: { users: any[] }) => {
      console.log('[presence] update', {
        count: data.users.length,
        names: data.users.map(u => u.name),
      });
      
      setRoom((prevRoom: any) => {
        if (prevRoom) {
          return {
            ...prevRoom,
            users: data.users
          };
        }
        return prevRoom;
      });
    });

    socketInstance.on('room:joined', (data: { roomId: string; date: string }) => {
      console.log('Joined date session:', data);
      const joinedRoom = {
        id: data.roomId,
        name: `Session ${data.date}`,
        adminId: '',
        users: [],
        isVotingOpen: true,
        showResults: false,
        createdAt: new Date(),
        date: data.date,
      };
      setRoom(joinedRoom);
      setAppState('voting');
    });

    socketInstance.on('voting-started', () => {
      setRoom((prev: any) => prev ? { ...prev, isVotingOpen: true, showResults: false } : prev);
    });

    socketInstance.on('reveal', (data: { results: { user: string; emoji: string; score: number }[] }) => {
      console.log('[reveal] results', data);
      setRoom((prev: any) => {
        if (!prev) return prev;
        const idToVote = new Map<string, { emoji: string; score: number }>();
        for (const r of data.results) idToVote.set(r.user, { emoji: r.emoji, score: r.score });
        const users = prev.users.map((u: any) => {
          const v = idToVote.get(u.id);
          return v ? { ...u, vote: { emoji: v.emoji, scale: v.score }, hasVoted: true } : u;
        });
        return { ...prev, users, showResults: true, isVotingOpen: false };
      });
    });

    socketInstance.on('reset', () => {
      setRoom((prev: any) => {
        if (!prev) return prev;
        const users = prev.users.map((u: any) => ({ ...u, hasVoted: false, vote: undefined }));
        return { ...prev, users, isVotingOpen: false, showResults: false };
      });
    });

    // Load user's voted dates from localStorage
    const storedVotedDates = localStorage.getItem('votedDates');
    if (storedVotedDates) {
      setVotedDates(JSON.parse(storedVotedDates));
    }

    // Load mood history from localStorage
    const storedHistory = localStorage.getItem('moodHistory');
    if (storedHistory) {
      setMoodHistory(JSON.parse(storedHistory));
    }

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSelectPerson = (memberId: TeamMemberId, memberName: string) => {
    console.log('[DEBUG] handleSelectPerson', { memberId, memberName });
    const user = {
      id: memberId,
      name: memberName,
    };
    setCurrentUser(user);
    setAppState('calendar');
  };

  const handleSelectDate = (date: string) => {
    console.log('[DEBUG] handleSelectDate', { date, currentUser });
    if (!socket || !currentUser) return;

    setSelectedDate(date);
    
    // Use date as room ID
    const roomId = date;
    
    // Check if user already voted for this date
    const userKey = `${currentUser.id}-${date}`;
    const hasVoted = votedDates.includes(userKey);

    // Create a room with all team members
    const newRoom = {
      id: roomId,
      name: `Session ${date}`,
      adminId: socket.id || 'unknown',
      users: TEAM_MEMBERS.map(member => {
        const memberKey = `${member.id}-${date}`;
        const memberHasVoted = votedDates.includes(memberKey);
        const memberVote = moodHistory.find(h => h.teamMemberId === member.id && h.date === date);
        
        return {
          id: member.id,
          userId: member.id,
          name: member.name,
          isAdmin: member.id === currentUser.id,
          hasVoted: memberHasVoted,
          vote: memberVote?.vote,
          teamMemberId: member.id,
        };
      }),
      isVotingOpen: true,
      showResults: false,
      createdAt: new Date(),
      date: date,
    };
    
    setRoom(newRoom);
    setAppState('voting');
  };

  const handleVote = (vote: Vote) => {
    if (socket && currentUser && selectedDate) {
      console.log('[vote] submit', { vote, currentUser, selectedDate });

      // Save to voted dates
      const userKey = `${currentUser.id}-${selectedDate}`;
      const newVotedDates = [...votedDates, userKey];
      setVotedDates(newVotedDates);
      localStorage.setItem('votedDates', JSON.stringify(newVotedDates));

      // Save to mood history
      const newEntry: MoodHistory = {
        teamMemberId: currentUser.id,
        date: selectedDate,
        vote: { ...vote, timestamp: new Date() }
      };
      const newHistory = [...moodHistory, newEntry];
      setMoodHistory(newHistory);
      localStorage.setItem('moodHistory', JSON.stringify(newHistory));

      // Update room users to show vote
      setRoom((prevRoom: Room | null) => {
        if (!prevRoom) return prevRoom;
        const updatedUsers = prevRoom.users.map(u => 
          u.id === currentUser.id 
            ? { ...u, hasVoted: true, vote: { emoji: vote.emoji, scale: vote.scale } }
            : u
        );
        
        // Check if all users have voted
        const allVoted = updatedUsers.every(u => u.hasVoted);
        
        return {
          ...prevRoom,
          users: updatedUsers,
          showResults: allVoted,
          isVotingOpen: !allVoted
        };
      });
    }
  };

  const handleBackToCalendar = () => {
    setAppState('calendar');
    setRoom(null);
    setSelectedDate(null);
  };

  const handleViewHistory = () => {
    setAppState('history');
  };

  const handleBackFromHistory = () => {
    setAppState('calendar');
  };

  // Person Selection Screen
  if (appState === 'person-select' || !currentUser) {
    return <PersonSelector onSelectPerson={handleSelectPerson} />;
  }

  // History View
  if (appState === 'history') {
    return (
      <HistoryView
        currentUser={currentUser}
        onBack={handleBackFromHistory}
        history={moodHistory}
      />
    );
  }

  // Calendar View
  if (appState === 'calendar') {
    // Filter voted dates for current user
    const userVotedDates = votedDates
      .filter(key => key.startsWith(`${currentUser.id}-`))
      .map(key => key.split('-').slice(1).join('-'));

    return (
      <CalendarView
        currentUser={currentUser}
        onSelectDate={handleSelectDate}
        onViewHistory={handleViewHistory}
        votedDates={userVotedDates}
      />
    );
  }

  // Voting Room
  if (appState === 'voting' && room) {
    const roomUser = {
      id: socket?.id || currentUser.id,
      userId: currentUser.id,
      name: currentUser.name,
      isAdmin: false,
      hasVoted: false,
      teamMemberId: currentUser.id,
    };

    return (
      <VotingRoom
        room={room}
        currentUser={roomUser}
        onFinishSession={handleBackToCalendar}
        onRevealResults={() => {
          if (socket && room) {
            socket.emit('reveal', { roomId: room.id });
          }
        }}
        onResetVoting={() => {
          if (socket && room) {
            socket.emit('reset', { roomId: room.id });
          }
        }}
        onVote={handleVote}
        onBack={handleBackToCalendar}
      />
    );
  }

  return <PersonSelector onSelectPerson={handleSelectPerson} />;
}
