# Project: Trix & Tarneeb Score Tracker

This is a mobile-first, frontend-only React application to track scores for card games (Trix and Tarneeb).
There is NO backend. All data must be persisted to the browser's `localStorage` using Zustand's `persist` middleware.

## 1. Tech Stack

- React 18 (Vite) with TypeScript.
- Tailwind CSS for styling (Must be Mobile-First, dark mode UI, big touch targets).
- Zustand (with `persist`) for state management.
- `lucide-react` for icons.

## 2. Core Game Logic & Rules

- **Players:** Exactly 4 players per session.
- **Game Modes:**
  1. `solo` (Every player for themselves).
  2. `teams` (Player 1 & 3 are Team A, Player 2 & 4 are Team B).
- **Rounds (الجلسة):** A game consists of multiple rounds. In each round, a score is recorded for each of the 4 players.
- **Score Rules (CRITICAL):**
  - Scores can be positive, negative, or zero.
  - Scores can NEVER be `null`, `undefined`, or empty. If an input is cleared, it must default to `0`.
  - Input fields must easily support typing negative numbers (e.g., `-150`).

## 3. Calculation & Ranking Rules

At any time, or at the end of the session, the app must calculate:

- **Individual Total:** Sum of all rounds for each player.
- **Individual Rank:** Sort players by their total score (Highest to Lowest).
- **If Mode is 'teams':**
  - Calculate Team A total (Player 1 + Player 3) and Team B total (Player 2 + 4).
  - Determine Winning Team.
  - Still show individual rankings as secondary info.

## 4. Architecture & State (Zustand)

The Zustand store (`src/store/useGameStore.ts`) must hold:

- `players`: Array of 4 `{ id, name, team }`.
- `mode`: 'solo' | 'teams' | null.
- `rounds`: Array of `{ id, scores: { playerId: scoreValue } }`.
- Actions: `startGame()`, `addRound()`, `updateRoundScore()`, `endGame()`, `resetGame()`.

## 5. Development Phases (Execute step-by-step)

**Phase 1:** Setup Tailwind & the Zustand Store (with persistence and math logic).
**Phase 2:** "Setup Screen" UI (Enter 4 player names, select Solo/Teams mode).
**Phase 3:** "Scoreboard Screen" UI (A mobile-friendly grid/table to view rounds and an input row to add new round scores).
**Phase 4:** "Results Screen" UI (Calculates final rankings, crowns the winner/winning team, and offers a 'New Game' button).

Do not build everything at once. Focus on mobile UI/UX, as this will be used on a phone while playing cards on a table.
