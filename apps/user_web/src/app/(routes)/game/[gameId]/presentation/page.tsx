'use client';

import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';

// Import screen components from the './components' subdirectory
import TitleScreen from './components/TitleScreen';
import WaitingScreen from './components/WaitingScreen';
import QuizScreen from './components/QuizScreen';
import CorrectAnswerScreen from './components/CorrectAnswerScreen';
import CurrentRankingScreen from './components/CurrentRankingScreen';
import FinalRankingScreen from './components/FinalRankingScreen';

export type GameScreen =
  | 'title'
  | 'waiting'
  | 'quiz'
  | 'correctAnswer'
  | 'currentRanking'
  | 'finalRanking';

export default function GamePresentationPage() {
  const params = useParams();
  const gameId = params.gameId as string; // gameId is available if this page is under [gameId]

  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');

  const navigateTo = useCallback((screen: GameScreen) => {
    setCurrentScreen(screen);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'title':
        return <TitleScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'waiting':
        return <WaitingScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'quiz':
        return <QuizScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'correctAnswer':
        return <CorrectAnswerScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'currentRanking':
        return <CurrentRankingScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'finalRanking':
        return <FinalRankingScreen gameId={gameId} />;
      default:
        return <div>Unknown Screen. Game ID: {gameId} for Presentation</div>;
    }
  };

  return renderScreen()
}
