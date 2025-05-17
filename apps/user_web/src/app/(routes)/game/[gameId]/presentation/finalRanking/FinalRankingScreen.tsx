import React from 'react';
import Image from 'next/image';
import BackgroundWideGray from '@/app/_images/BackgroundWideGray.png';
import Confetti from '@/app/_images/Confetti.png';
// モックデータ
const mockRankingData = [
  // 左列（上位3チーム）
  [
    { rank: 1, name: "チームA", score: 1000, thumbnail: "https://example.com/team1.jpg" },
    { rank: 2, name: "チームB", score: 850, thumbnail: "https://example.com/team2.jpg" },
    { rank: 3, name: "チームC", score: 700, thumbnail: "https://example.com/team3.jpg" },
  ],
  // 中央列（6チーム）
  [
    { rank: 4, name: "チームD", score: 650, thumbnail: "https://example.com/team4.jpg" },
    { rank: 5, name: "チームE", score: 600, thumbnail: "https://example.com/team5.jpg" },
    { rank: 6, name: "チームF", score: 550, thumbnail: "https://example.com/team6.jpg" },
    { rank: 7, name: "チームG", score: 500, thumbnail: "https://example.com/team7.jpg" },
    { rank: 8, name: "チームH", score: 450, thumbnail: "https://example.com/team8.jpg" },
    { rank: 9, name: "チームI", score: 400, thumbnail: "https://example.com/team9.jpg" },
  ],
  // 右列（残りのチーム）
  [
    { rank: 10, name: "チームJ", score: 350, thumbnail: "https://example.com/team10.jpg" },
    { rank: 11, name: "チームK", score: 300, thumbnail: "https://example.com/team11.jpg" },
    { rank: 12, name: "チームL", score: 250, thumbnail: "https://example.com/team12.jpg" },
  ],
];


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