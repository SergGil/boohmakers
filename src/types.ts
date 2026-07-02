export interface AppUser {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

export interface Competition {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  memberIds: string[];
  createdAt: number;
}

export type MatchStatus = 'scheduled' | 'finished';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: number;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Prediction {
  uid: string;
  displayName: string;
  homeScore: number;
  awayScore: number;
  submittedAt: number;
}
