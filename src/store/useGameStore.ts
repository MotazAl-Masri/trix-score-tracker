import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameMode, GameStatus, Player, PlayerTotal, Round, TeamCalculationResult } from '../types/game';

export interface GameState {
  players: Player[];
  mode: GameMode | null;
  status: GameStatus;
  rounds: Round[];

  // Actions
  setMode: (mode: GameMode) => void;
  setPlayerName: (id: string, name: string) => void;
  startGame: (playerNames?: string[], mode?: GameMode) => void;
  addRound: (scores?: Record<string, number>) => void;
  updateRoundScore: (roundId: string, playerId: string, score: number) => void;
  deleteRound: (roundId: string) => void;
  endGame: () => void;
  resetGame: () => void;
  newGameSamePlayers: () => void;
  setStatus: (status: GameStatus) => void;

  // Calculators / Getters
  getPlayerTotals: () => PlayerTotal[];
  getTeamTotals: () => TeamCalculationResult;
}

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Player 1', team: 'A' },
  { id: 'p2', name: 'Player 2', team: 'B' },
  { id: 'p3', name: 'Player 3', team: 'A' },
  { id: 'p4', name: 'Player 4', team: 'B' },
];

export const sanitizeScore = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: INITIAL_PLAYERS,
      mode: 'solo',
      status: 'setup',
      rounds: [],

      setMode: (mode: GameMode) => {
        set({ mode });
      },

      setPlayerName: (id: string, name: string) => {
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, name: name } : p
          ),
        }));
      },

      startGame: (playerNames?: string[], mode?: GameMode) => {
        set((state) => {
          const selectedMode = mode || state.mode || 'solo';
          const updatedPlayers = state.players.map((p, idx) => {
            const customName = playerNames && playerNames[idx]?.trim();
            return {
              ...p,
              name: customName && customName.length > 0 ? customName : p.name.trim() || `Player ${idx + 1}`,
              team: (idx === 0 || idx === 2 ? 'A' : 'B') as 'A' | 'B',
            };
          });

          return {
            players: updatedPlayers,
            mode: selectedMode,
            status: 'playing',
            rounds: [], // starting a new match session
          };
        });
      },

      addRound: (scores?: Record<string, number>) => {
        set((state) => {
          const roundScores: Record<string, number> = {};
          for (const player of state.players) {
            roundScores[player.id] = sanitizeScore(scores?.[player.id]);
          }

          const newRound: Round = {
            id: `round-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            scores: roundScores,
            createdAt: Date.now(),
          };

          return {
            rounds: [...state.rounds, newRound],
          };
        });
      },

      updateRoundScore: (roundId: string, playerId: string, score: number) => {
        set((state) => {
          const safeScore = sanitizeScore(score);
          return {
            rounds: state.rounds.map((round) => {
              if (round.id !== roundId) return round;
              return {
                ...round,
                scores: {
                  ...round.scores,
                  [playerId]: safeScore,
                },
              };
            }),
          };
        });
      },

      deleteRound: (roundId: string) => {
        set((state) => ({
          rounds: state.rounds.filter((r) => r.id !== roundId),
        }));
      },

      endGame: () => {
        set({ status: 'completed' });
      },

      resetGame: () => {
        set({
          status: 'setup',
          rounds: [],
        });
      },

      newGameSamePlayers: () => {
        set({
          status: 'playing',
          rounds: [],
        });
      },

      setStatus: (status: GameStatus) => {
        set({ status });
      },

      // Calculate individual totals and rankings (Highest to Lowest)
      getPlayerTotals: () => {
        const { players, rounds } = get();
        
        // Sum rounds for each player
        const totalsMap: Record<string, number> = {};
        for (const player of players) {
          totalsMap[player.id] = 0;
        }

        for (const round of rounds) {
          for (const player of players) {
            totalsMap[player.id] += sanitizeScore(round.scores[player.id]);
          }
        }

        // Sort players by total score (Highest to Lowest)
        const sorted = [...players]
          .map((player) => ({
            player,
            total: totalsMap[player.id] ?? 0,
            rank: 1,
          }))
          .sort((a, b) => b.total - a.total);

        // Assign ranks with tie handling
        let currentRank = 1;
        for (let i = 0; i < sorted.length; i++) {
          if (i > 0 && sorted[i].total < sorted[i - 1].total) {
            currentRank = i + 1;
          }
          sorted[i].rank = currentRank;
        }

        return sorted;
      },

      // Calculate team totals: Team A (p1 + p3) vs Team B (p2 + p4)
      getTeamTotals: () => {
        const { players, rounds } = get();

        const playerTotals: Record<string, number> = {};
        for (const player of players) {
          playerTotals[player.id] = 0;
        }

        for (const round of rounds) {
          for (const player of players) {
            playerTotals[player.id] += sanitizeScore(round.scores[player.id]);
          }
        }

        const teamAPlayers = players.filter((p) => p.team === 'A');
        const teamBPlayers = players.filter((p) => p.team === 'B');

        const teamATotal = teamAPlayers.reduce((sum, p) => sum + (playerTotals[p.id] ?? 0), 0);
        const teamBTotal = teamBPlayers.reduce((sum, p) => sum + (playerTotals[p.id] ?? 0), 0);

        let winningTeam: 'A' | 'B' | 'tie' = 'tie';
        if (teamATotal > teamBTotal) winningTeam = 'A';
        else if (teamBTotal > teamATotal) winningTeam = 'B';

        return {
          teamA: {
            team: 'A',
            name: 'Team A (فريق أ)',
            playerIds: teamAPlayers.map((p) => p.id),
            players: teamAPlayers,
            total: teamATotal,
          },
          teamB: {
            team: 'B',
            name: 'Team B (فريق ب)',
            playerIds: teamBPlayers.map((p) => p.id),
            players: teamBPlayers,
            total: teamBTotal,
          },
          winningTeam,
          difference: Math.abs(teamATotal - teamBTotal),
        };
      },
    }),
    {
      name: 'trix-tarneeb-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        players: state.players,
        mode: state.mode,
        status: state.status,
        rounds: state.rounds,
      }),
    }
  )
);
