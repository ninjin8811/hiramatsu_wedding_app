import React, { useMemo, useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import BackgroundWideGray from '@/app/_images/BackgroundWideGray.png';
import Confetti from '@/app/_images/Confetti.png';
import RankingResultTitleContainer from '@/app/_images/RankingResultTitleContainer.png';
import RankingItemNormal from './RankingItemNormal';
import RankingItemGorgeous from './RankingItemGorgeous';
import styles from './FinalRankingScreen.module.scss';

// サムネイル画像をインポート
import ThumbnailTeamA from '@/app/_images/ThumbnailTeamA.jpg';
import ThumbnailTeamB from '@/app/_images/ThumbnailTeamB.jpg';
import ThumbnailTeamC from '@/app/_images/ThumbnailTeamC.jpg';
import ThumbnailTeamD from '@/app/_images/ThumbnailTeamD.jpg';
import ThumbnailTeamE from '@/app/_images/ThumbnailTeamE.jpg';
import ThumbnailTeamF from '@/app/_images/ThumbnailTeamF.jpg';
import ThumbnailTeamG from '@/app/_images/ThumbnailTeamG.jpg';
import ThumbnailTeamH from '@/app/_images/ThumbnailTeamH.jpg';
import ThumbnailTeamI from '@/app/_images/ThumbnailTeamI.jpg';
import ThumbnailTeamJ from '@/app/_images/ThumbnailTeamJ.jpg';
import ThumbnailTeamK from '@/app/_images/ThumbnailTeamK.jpg';
import ThumbnailTeamL from '@/app/_images/ThumbnailTeamL.jpg';
import ThumbnailTeamM from '@/app/_images/ThumbnailTeamM.jpg';
import ThumbnailTeamN from '@/app/_images/ThumbnailTeamN.jpg';
import ThumbnailTeamO from '@/app/_images/ThumbnailTeamO.jpg';

// モックデータ（スコアのみ）
const mockTeams = [
  { name: "チームA", score: 1000, thumbnail: ThumbnailTeamA },
  { name: "チームB", score: 850, thumbnail: ThumbnailTeamB },
  { name: "チームC", score: 700, thumbnail: ThumbnailTeamC },
  { name: "チームD", score: 650, thumbnail: ThumbnailTeamD },
  { name: "チームE", score: 600, thumbnail: ThumbnailTeamE },
  { name: "チームF", score: 550, thumbnail: ThumbnailTeamF },
  { name: "チームG", score: 500, thumbnail: ThumbnailTeamG },
  { name: "チームH", score: 450, thumbnail: ThumbnailTeamH },
  { name: "チームI", score: 400, thumbnail: ThumbnailTeamI },
  { name: "チームJ", score: 350, thumbnail: ThumbnailTeamJ },
  { name: "チームK", score: 300, thumbnail: ThumbnailTeamK },
  { name: "チームL", score: 250, thumbnail: ThumbnailTeamL },
  { name: "チームM", score: 200, thumbnail: ThumbnailTeamM },
  { name: "チームN", score: 150, thumbnail: ThumbnailTeamN },
  { name: "チームO", score: 100, thumbnail: ThumbnailTeamO },
];

interface TeamItemProps {
  rank: number;
  name: string;
  score: number;
  thumbnail: StaticImageData;
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
  const [visibleTeams, setVisibleTeams] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentTopThreeIndex, setCurrentTopThreeIndex] = useState(-1);

  // スコアとチーム名でソートし、ランクを付与
  const sortedTeams = useMemo(() => {
    return mockTeams
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.name.localeCompare(b.name);
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1
      }));
  }, []);

  // 4-15位のチームを順番に表示（下の順位から）
  useEffect(() => {
    const teams4to15 = Array.from({ length: 14 }, (_, i) => i + 4).reverse(); // 15位から4位の順に
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < teams4to15.length) {
        setVisibleTeams(prev => [...prev, teams4to15[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        // 4-15位の表示が完了したら、3秒待ってから3位から順番に表示開始
        setTimeout(() => {
          setCurrentTopThreeIndex(2); // 3位から開始
        }, 3000);
      }
    }, 500); // 0.5秒ごとに1チームずつ表示

    return () => clearInterval(interval);
  }, []);

  // 3位から順番に表示
  useEffect(() => {
    if (currentTopThreeIndex >= 0) {
      const timer = setTimeout(() => {
        if (currentTopThreeIndex > 0) {
          setCurrentTopThreeIndex(prev => prev - 1); // 2位、1位の順に表示
        } else {
          // 1位の表示が完了したら紙吹雪を表示
          setShowConfetti(true);
        }
      }, 3000); // 3秒間隔で表示

      return () => clearTimeout(timer);
    }
  }, [currentTopThreeIndex]);

  // 3つの列に分割
  const rankingColumns = useMemo(() => {
    const visibleTeamsSet = new Set(visibleTeams);
    const topThreeVisible = currentTopThreeIndex >= 0;

    return [
      sortedTeams.slice(0, 3).map(team => ({
        ...team,
        isVisible: topThreeVisible && team.rank <= 3 - currentTopThreeIndex
      })),
      sortedTeams.slice(3, 9).map(team => ({
        ...team,
        isVisible: visibleTeamsSet.has(team.rank)
      })),
      sortedTeams.slice(9).map(team => ({
        ...team,
        isVisible: visibleTeamsSet.has(team.rank)
      }))
    ];
  }, [sortedTeams, visibleTeams, currentTopThreeIndex]);

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
      {showConfetti && (
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
      )}
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
                team.rank <= 3 ? (
                  <div key={team.name} className={styles.rankingItemWrapper}>
                    {team.isVisible ? (
                      <RankingItemGorgeous
                        rank={team.rank}
                        name={team.name}
                        score={team.score}
                        thumbnail={team.thumbnail}
                      />
                    ) : (
                      <div className={styles.placeholder} />
                    )}
                  </div>
                ) : (
                  <div
                    key={team.name}
                    className={`${styles.rankingItemWrapper} ${
                      team.isVisible ? styles.visible : styles.hidden
                    }`}
                  >
                    <RankingItemNormal
                      rank={team.rank}
                      name={team.name}
                      score={team.score}
                    />
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinalRankingScreen; 