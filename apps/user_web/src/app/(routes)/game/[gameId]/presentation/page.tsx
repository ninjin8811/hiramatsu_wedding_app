'use client';

import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { navigateToQuiz } from './actions';

// Import screen components from the './components' subdirectory
import TitleScreen from './_components/TitleScreen';
import WaitingScreen from './_components/WaitingScreen';
import TeamsScreen from './_components/TeamsScreen';

export type GameScreen =
  | 'title'
  | 'waiting'
  | 'teams'
  | 'quiz'

export default function GamePresentationPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');

  const navigateTo = useCallback(async (screen: GameScreen) => {
    switch (screen) {
      case 'quiz':
        await navigateToQuiz(gameId);
      default:
        setCurrentScreen(screen);
    }
  }, [gameId]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'title':
        return <TitleScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'waiting':
        return <WaitingScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'teams':
        return <TeamsScreen gameId={gameId} onNavigate={navigateTo} />;
      case 'quiz':
      default:
        return <div>Unknown Screen. Game ID: {gameId} for Presentation</div>;
    }
  };

  return renderScreen()
}
