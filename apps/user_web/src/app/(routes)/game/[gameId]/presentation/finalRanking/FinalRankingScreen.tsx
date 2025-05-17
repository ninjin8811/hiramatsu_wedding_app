import React from 'react';
import Image from 'next/image';
import BackgroundWideGray from '@/app/_images/BackgroundWideGray.png';
import Confetti from '@/app/_images/Confetti.png';
import styles from './FinalRankingScreen.module.scss'; // 新しいSCSSファイルをインポート

interface FinalRankingScreenProps {
  gameId: string;
  // This screen might not have navigation, or only to a "play again" or "exit" state
}

const FinalRankingScreen: React.FC<FinalRankingScreenProps> = ({ gameId }) => {
  return (
    <div className={styles.container}>
      <Image
        src={BackgroundWideGray}
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        className={styles.backgroundImage} // Next.jsのImageコンポーネントはclassNameプロップを受け付けます
      />
      <div className={styles.confettiContainer}>
        <Image
          src={Confetti}
          alt="Confetti"
          layout="fill"
          objectFit="contain"
          quality={100}
          className={styles.confettiImage} // Next.jsのImageコンポーネントはclassNameプロップを受け付けます
        />
      </div>
      <div className={styles.content}>
        <h2>Final Ranking for Game {gameId}</h2>
        <p>Congratulations to the winner!</p>
        {/* Add display for final scores and ranking */}
        {/* Example: <button onClick={() => onNavigate('title')}>Play Again</button> */}
      </div>
    </div>
  );
};

export default FinalRankingScreen; 