import React from 'react';
import { GameScreen } from '../page';

interface QuizScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ gameId, onNavigate }) => {
  // Add quiz logic here (display question, options, handle answer)
  return (
    <div>
      <h2>Quiz Screen for Game {gameId} (Presentation)</h2>
      <p>This is where the quiz question will be displayed.</p>
      {/* Example: Button to submit answer and go to correct answer screen */}
      <button onClick={() => onNavigate('correctAnswer')}>Submit Answer (Show Correct Answer)</button>
    </div>
  );
};

export default QuizScreen; 