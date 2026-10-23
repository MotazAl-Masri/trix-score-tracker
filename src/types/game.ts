export type GameMode = 'solo' | 'teams';
export type TeamId = 'A' | 'B';
export type GameStatus = 'setup' | 'playing' | 'completed';

export interface Player {
  id: string;
  name: string;
  team: TeamId;
}

export interface Round {
  id: string;
  scores: Record<string, number>; // playerId -> scoreValue
  createdAt?: number;
}

export interface PlayerTotal {
  player: Player;
  total: number;
  rank: number;
}

export interface TeamTotal {
  team: TeamId;
  name: string;
  playerIds: string[];
  players: Player[];
  total: number;
}

export interface TeamCalculationResult {
  teamA: TeamTotal;
  teamB: TeamTotal;
  winningTeam: TeamId | 'tie';
  difference: number;
}
