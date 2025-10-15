export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  hasVoted: boolean;
  vote?: Vote;
}

export interface Vote {
  emoji: string;
  scale: number;
}

export interface Room {
  id: string;
  name: string;
  adminId: string;
  users: User[];
  isVotingOpen: boolean;
  showResults: boolean;
  createdAt: Date;
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
