import React from 'react';

interface FinalRankingScreenProps {
  gameId: string;
  // This screen might not have navigation, or only to a "play again" or "exit" state
}

const FinalRankingScreen: React.FC<FinalRankingScreenProps> = ({ gameId }) => {
  return (
    <div>
      <h2>Final Ranking for Game {gameId}</h2>
      <p>Congratulations to the winner!</p>
      {/* Add display for final scores and ranking */}
      {/* Example: <button onClick={() => onNavigate('title')}>Play Again</button> */}
    </div>
  );
};

export default FinalRankingScreen; 