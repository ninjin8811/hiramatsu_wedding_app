'use client';

import { useEffect } from 'react';
import styles from './CurrentRanking.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const characterColors = new Map<`cart_${number}`, string>([
  ['cart_1', '#FB0025'],
  ['cart_2', '#DE6100'],
  ['cart_3', '#EDDD00'],
  ['cart_4', '#0CD600'],
  ['cart_5', '#00A337'],
  ['cart_6', '#00D3F4'],
  ['cart_7', '#0062D2'],
  ['cart_8', '#6F00CA'],
  ['cart_9', '#ED009B'],
  ['cart_10', '#BD8527'],
  ['cart_11', '#705126'],
  ['cart_12', '#313131'],
  ['cart_13', '#676767'],
  ['cart_14', '#CFCFCF'],
  ['cart_15', '#B779EC'],
  ['cart_16', '#FA7AE6'],
]);

const MAX_SCORE = 900; // 仮の合計最大スコア

interface CurrentRankingScreenProps {
  currentQuestionIdx: number;
  nextPath: string;
  rankings: Array<{
    id: string;
    teamName: string;
    score: number;
    rank: number;
    characterImage: string;
    characterColor: string;
  }>;
}

const CurrentRankingScreen: React.FC<CurrentRankingScreenProps> = ({
  currentQuestionIdx,
  nextPath,
  rankings = [],
}) => {
  const router = useRouter();

  const dummyRankings = Array.from({ length: 16 }, (_, i) => {
    const characterImage = `cart_${i + 1}.png`;
    return {
      id: `team-${i + 1}`,
      teamName: `Team ${i + 1}`,
      score: Math.floor(Math.random() * MAX_SCORE * 0.5) + MAX_SCORE * 0.1,
      rank: i + 1,
      characterImage: characterImage,
      characterColor: characterColors.get(`cart_${i + 1}`) || '#FFFFFF',
    };
  })
    .sort((a, b) => b.score - a.score)
    .map((team, index) => ({ ...team, rank: index + 1 }));

  const displayRankings = rankings.length > 0 ? rankings : dummyRankings;

  const top6Rankings = displayRankings.slice(0, 6);
  const otherRankings = displayRankings.slice(6);

  // キーボード操作 (左右矢印で画面遷移)
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
            const cartWidthPercentage = 15; // 仮にカートの表示幅が親の15%とする
            const maxLeftPercentage = 100 - cartWidthPercentage;
            const positionPercentage = Math.min(maxLeftPercentage, (team.score / MAX_SCORE) * maxLeftPercentage);

            return (
              <div key={team.id} className={styles.lane} style={{zIndex: index}}>
                <div className={styles.cartAndScoreWrapper}>
                  <div
                    className={styles.positionedCart}
                    style={{ marginLeft: `${positionPercentage}%` }} // left から marginLeft に変更
                  >
                    <div className={styles.cartImageContainer}>
                      <Image
                        src={`/images/carts/${team.characterImage}`}
                        alt={team.teamName}
                        width={180} // これらの値はCSSでの表示サイズに影響しない場合がある
                        height={100}
                        className={styles.cartImage}
                      />
                      <div
                        className={styles.scoreBubble}
                        style={{ backgroundColor: `rgba(${parseInt(team.characterColor.slice(1, 3), 16)}, ${parseInt(team.characterColor.slice(3, 5), 16)}, ${parseInt(team.characterColor.slice(5, 7), 16)}, 0.8)` }}
                      >
                        {team.score}
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
        {otherRankings.map((team) => (
          <div key={team.id} className={styles.bottomRankItem}>
            <div className={styles.bottomRankNumber}>
              <Image
                src={`/images/current_ranking_numbers/number_${team.rank}.png`}
                alt={`Rank ${team.rank}`}
                width={39}
                height={47}
              />
            </div>
            <div className={styles.bottomCartImageContainer}>
              <Image
                src={`/images/carts/${team.characterImage}`}
                alt={team.teamName}
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