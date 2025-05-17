'use client';

import { useEffect, useState } from 'react';
import styles from './CurrentRanking.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const MAX_SCORE = 900; // 仮の合計最大スコア

export interface User {
  userId: string;
  teamName: string;
  thumbnail: string;
  characterImage: string;
  characterColor: string;
  prevScore: number;
  currentScore: number;
}

interface CurrentRankingScreenProps {
  nextPath: string;
  users: Array<User>;
}

const CurrentRankingScreen: React.FC<CurrentRankingScreenProps> = ({
  nextPath,
  users = [],
}) => {
  const router = useRouter();
  const [displayRankings, setDisplayRankings] = useState<Array<User>>(
    users.toSorted((a, b) => b.prevScore - a.prevScore)
  );
  const [isSortedByPrevScore, setIsSortedByPrevScore] = useState(true);

  useEffect(() => {
    // 3秒後に currentScore でソートして表示
    const timer = setTimeout(() => {
      const sortedByCurrentScore = users
        .toSorted((a, b) => b.currentScore - a.currentScore);
      setDisplayRankings(sortedByCurrentScore);
      setIsSortedByPrevScore(false); // currentScoreでソートしたことをマーク
    }, 3000);

    return () => clearTimeout(timer);
  }, [users]);

  const top6Rankings = displayRankings.slice(0, 6);
  const otherRankings = displayRankings.slice(6);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        if (window.confirm("前の画面へ戻りますか?")) {
          router.back();
        }
      } else if (event.key === 'ArrowRight') {
        router.push(nextPath);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPath, router]);

  return (
    <main className={styles.bg}>
      <div className={styles.header}>
        <Image
          src="/images/stage.png"
          alt="ステージの背景"
          width={3840}
          height={880}
          priority
        />
      </div>

      <div className={styles.rankingArea}>
        <div className={styles.laneBorderTop}></div>
        <div className={styles.lanesContainer}>
          {top6Rankings.map((team, index) => {
            const cartWidthPercentage = 15;
            const maxLeftPercentage = 100 - cartWidthPercentage;
            const scoreToUse = isSortedByPrevScore ? team.prevScore : team.currentScore;
            const positionPercentage = Math.min(maxLeftPercentage, (scoreToUse / MAX_SCORE) * maxLeftPercentage);

            return (
              <div key={team.userId} className={styles.lane} style={{zIndex: index}}>
                <div className={styles.cartAndScoreWrapper}>
                  <div
                    className={styles.positionedCart}
                    style={{ marginLeft: `${positionPercentage}%` }}
                  >
                    <div className={styles.cartImageContainer}>
                      <Image
                        src={team.characterImage}
                        alt={`${index + 1}位`}
                        width={180}
                        height={100}
                        className={styles.cartImage}
                      />
                      <div
                        className={styles.scoreBubble}
                        style={{ backgroundColor: `rgba(${parseInt(team.characterColor.slice(1, 3), 16)}, ${parseInt(team.characterColor.slice(3, 5), 16)}, ${parseInt(team.characterColor.slice(5, 7), 16)}, 0.8)` }}
                      >
                        {scoreToUse}
                        <span>pt</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.laneNumber}>
                  <Image
                    src={`/images/lane/lane_${index + 1}.png`}
                    alt={`Lane ${index + 1}`}
                    width={100}
                    height={150}
                    className={styles.laneNumberImage}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.laneBorderBottom}></div>
      </div>

      <div className={styles.bottomRankingArea}>
        {otherRankings.map((team, index ) => (
          <div key={team.userId} className={styles.bottomRankItem}>
            <div className={styles.bottomRankNumber}>
              <Image
                src={`/images/current_ranking_numbers/number_${index+1+6}.png`}
                alt={`Rank ${index + 1 + 6}`}
                width={39}
                height={47}
              />
            </div>
            <div className={styles.bottomCartImageContainer}>
              <Image
                src={team.characterImage}
                alt={`${index + 1 + 6}位`}
                width={130}
                height={139}
                className={styles.bottomCartImage}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default CurrentRankingScreen;