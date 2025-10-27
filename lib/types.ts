// Team members
export const TEAM_MEMBERS = [
  { id: 'arya', name: 'Arya', color: 'red', avatar: '👨‍💻' },
  { id: 'jeje', name: 'Jeje', color: 'blue', avatar: '👨‍💼' },
  { id: 'vivi', name: 'Vivi', color: 'yellow', avatar: '👩‍💻' },
  { id: 'yoga', name: 'Yoga', color: 'green', avatar: '👨‍🔧' },
  { id: 'revan', name: 'Revan', color: 'purple', avatar: '👨‍🎨' },
  { id: 'destu', name: 'Destu', color: 'blue', avatar: '👨‍🚀' },
] as const;

export type TeamMemberId = typeof TEAM_MEMBERS[number]['id'];
export type TeamMemberColor = typeof TEAM_MEMBERS[number]['color'];

export interface TeamMember {
  id: TeamMemberId;
  name: string;
  color: TeamMemberColor;
  avatar: string;
}

export interface User {
  userId?: string;
  id: string;
  name: string;
  isAdmin: boolean;
  hasVoted: boolean;
  vote?: Vote;
  teamMemberId?: TeamMemberId;
}

export interface Vote {
  emoji: string;
  scale: number;
  timestamp?: Date;
}

export interface DailySession {
  date: string; // YYYY-MM-DD format
  votes: Map<TeamMemberId, Vote>;
  isComplete: boolean;
}

export interface Room {
  id: string;
  name: string;
  adminId: string;
  users: User[];
  isVotingOpen: boolean;
  showResults: boolean;
  createdAt: Date;
  date?: string; // Date-based session
}

export interface MoodHistory {
  teamMemberId: TeamMemberId;
  date: string;
  vote: Vote;
}

export interface SocketEvents {
  'room-created': (room: Room) => void;
  'user-joined': (user: User) => void;
  'user-left': (userId: string) => void;
  'vote-submitted': (userId: string, vote: Vote) => void;
  'voting-closed': () => void;
  'results-revealed': () => void;
  'room-updated': (room: Room) => void;
}
