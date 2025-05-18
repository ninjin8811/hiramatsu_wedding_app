'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

// Import screen components from the './components' subdirectory
import TitleScreen from './components/TitleScreen';
import WaitingScreen from './components/WaitingScreen';
import CorrectAnswerScreen from './components/CorrectAnswerScreen';
import FinalRankingScreen from './finalRanking/FinalRankingScreen';

export type GameScreen =
  | 'title'
  | 'waiting'
  | 'quiz'
  | 'correctAnswer'
  | 'currentRanking'
  | 'finalRanking';

export default function GamePresentationPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const router = useRouter();

  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');

  const navigateTo = useCallback((screen: GameScreen) => {
    switch (screen) {
      case 'quiz':
        return router.push(`/game/${gameId}/presentation/quizzes/0`);
      case 'currentRanking':
        return router.push(`/game/${gameId}/presentation/quizzes/0/ranking`);
      default:
        setCurrentScreen(screen);
    }
  }, [router, gameId]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'title':
        return <TitleScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'waiting':
        return <WaitingScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'correctAnswer':
        return <CorrectAnswerScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'finalRanking':
        return <FinalRankingScreen gameId={gameId} />;
      case 'quiz':
      case 'currentRanking':
      default:
        return <div>Unknown Screen. Game ID: {gameId} for Presentation</div>;
    }
  };

  return renderScreen()
}
