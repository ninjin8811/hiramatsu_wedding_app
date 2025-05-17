import React, { useMemo } from 'react';
import Image from 'next/image';
import BackgroundWideGray from '@/app/_images/BackgroundWideGray.png';
import Confetti from '@/app/_images/Confetti.png';
import RankingResultTitleContainer from '@/app/_images/RankingResultTitleContainer.png';
import RankingItem from './RankingItem';
import styles from './FinalRankingScreen.module.scss';

// モックデータ（スコアのみ）
const mockTeams = [
  { name: "チームA", score: 1000, thumbnail: "https://example.com/team1.jpg" },
  { name: "チームB", score: 850, thumbnail: "https://example.com/team2.jpg" },
  { name: "チームC", score: 700, thumbnail: "https://example.com/team3.jpg" },
  { name: "チームD", score: 650, thumbnail: "https://example.com/team4.jpg" },
  { name: "チームE", score: 600, thumbnail: "https://example.com/team5.jpg" },
  { name: "チームF", score: 550, thumbnail: "https://example.com/team6.jpg" },
  { name: "チームG", score: 500, thumbnail: "https://example.com/team7.jpg" },
  { name: "チームH", score: 450, thumbnail: "https://example.com/team8.jpg" },
  { name: "チームI", score: 400, thumbnail: "https://example.com/team9.jpg" },
  { name: "チームJ", score: 350, thumbnail: "https://example.com/team10.jpg" },
  { name: "チームK", score: 300, thumbnail: "https://example.com/team11.jpg" },
  { name: "チームL", score: 250, thumbnail: "https://example.com/team12.jpg" },
  { name: "チームM", score: 200, thumbnail: "https://example.com/team13.jpg" },
  { name: "チームN", score: 150, thumbnail: "https://example.com/team14.jpg" },
  { name: "チームO", score: 100, thumbnail: "https://example.com/team15.jpg" },
];

interface TeamItemProps {
  rank: number;
  name: string;
  score: number;
  thumbnail: string;
}

const TeamItem: React.FC<TeamItemProps> = ({ rank, name, score, thumbnail }) => (
  <div className={styles.teamItem}>
    <span className={styles.rank}>{rank}</span>
    <span className={styles.name}>{name}</span>
    <span className={styles.score}>{score}</span>
  </div>
);

interface FinalRankingScreenProps {
  gameId: string;
}

const FinalRankingScreen: React.FC<FinalRankingScreenProps> = ({ gameId }) => {
  // スコアとチーム名でソートし、ランクを付与
  const sortedTeams = useMemo(() => {
    return mockTeams
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score; // スコアの降順
        }
        return a.name.localeCompare(b.name); // スコアが同じ場合はチーム名の昇順
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1
      }));
  }, []);

  // 3つの列に分割
  const rankingColumns = useMemo(() => {
    return [
      sortedTeams.slice(0, 3), // 上位3チーム
      sortedTeams.slice(3, 9), // 4-9位
      sortedTeams.slice(9),    // 10位以降
    ];
  }, [sortedTeams]);

  return (
    <div className={styles.container}>
      <Image
        src={BackgroundWideGray}
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        className={styles.backgroundImage}
      />
      <div className={styles.confettiContainer}>
        <Image
          src={Confetti}
          alt="Confetti"
          layout="fill"
          objectFit="contain"
          quality={100}
          className={styles.confettiImage}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <Image
            src={RankingResultTitleContainer}
            alt="Title Background"
            className={styles.titleBackground}
          />
          <h1 className={styles.title}>ランキング発表</h1>
        </div>
        <div className={styles.rankingContainer}>
          {rankingColumns.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.rankingColumn}>
              {column.map((team) => (
                <RankingItem
                  key={team.name}
                  rank={team.rank}
                  name={team.name}
                  score={team.score}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinalRankingScreen; 