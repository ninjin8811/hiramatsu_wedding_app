import React from 'react';
import { GameScreen } from '../../page';

interface CurrentRankingScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const CurrentRankingScreen: React.FC<CurrentRankingScreenProps> = ({ gameId, onNavigate }) => {
  return (
    <div>
      <h2>Current Ranking for Game {gameId}</h2>
      <p>Here are the current standings...</p>
      <button onClick={() => onNavigate('quiz')}>Next Quiz</button>
      <button onClick={() => onNavigate('finalRanking')}>Show Final Ranking</button>
    </div>
  );
};

export default CurrentRankingScreen; 