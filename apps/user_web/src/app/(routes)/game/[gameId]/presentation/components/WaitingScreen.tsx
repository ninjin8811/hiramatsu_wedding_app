import React from 'react';
import { GameScreen } from '../page';

interface WaitingScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({ gameId, onNavigate }) => {
  // Add logic for waiting, e.g., setTimeout to automatically navigate or wait for a signal
  return (
    <div>
      <h2>Waiting Screen for Game {gameId} (Presentation)</h2>
      <p>Waiting for other players or the game to start...</p>
      {/* For demonstration, a button to manually proceed to quiz */}
      <button onClick={() => onNavigate('quiz')}>Proceed to Quiz (Manual)</button>
    </div>
  );
};

export default WaitingScreen; 