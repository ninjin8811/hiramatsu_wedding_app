import React from 'react';
import { GameScreen } from '../../page';

interface CorrectAnswerScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const CorrectAnswerScreen: React.FC<CorrectAnswerScreenProps> = ({ gameId, onNavigate }) => {
  return (
    <div>
      <h2>Correct Answer Screen for Game {gameId}</h2>
      <p>The correct answer was X. You answered Y.</p>
      <button onClick={() => onNavigate('currentRanking')}>Show Current Ranking</button>
    </div>
  );
};

export default CorrectAnswerScreen; 