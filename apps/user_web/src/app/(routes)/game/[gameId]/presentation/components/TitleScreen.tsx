import React from 'react';
import { GameScreen } from '../page';

interface TitleScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ gameId, onNavigate }) => {
  return (
    <div>
      <h2>Title Screen for Game {gameId} (Presentation)</h2>
      <p>Welcome to the game!</p>
      <button onClick={() => onNavigate('waiting')}>Start Game (Go to Waiting)</button>
    </div>
  );
};

export default TitleScreen; 