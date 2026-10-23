import React from 'react';
import { useGameStore } from './store/useGameStore';
import { SetupScreen } from './components/SetupScreen';
import { ScoreboardScreen } from './components/ScoreboardScreen';
import { ResultsScreen } from './components/ResultsScreen';

const App: React.FC = () => {
  const { status } = useGameStore();

  if (status === 'setup') {
    return <SetupScreen />;
  }

  if (status === 'playing') {
    return <ScoreboardScreen />;
  }

  if (status === 'completed') {
    return <ResultsScreen />;
  }

  // Fallback (should never happen, but satisfies TypeScript)
  return <SetupScreen />;
};

export default App;
