import React from 'react';
import Image from 'next/image';
import BackgroundWideGray from '@/app/_images/BackgroundWideGray.png';
import Confetti from '@/app/_images/Confetti.png';
import RankingResultTitleContainer from '@/app/_images/RankingResultTitleContainer.png';
import RankingItemNormal from './RankingItemNormal';
import RankingItemGorgeous from './RankingItemGorgeous';
import styles from './FinalRankingScreen.module.scss';
import { useRankingAnimation } from './useRankingAnimation'; // カスタムフックをインポート

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

// TeamItemProps と TeamItem は現状このファイルでは未使用なのでコメントアウトまたは削除
// interface TeamItemProps {
//   rank: number;
//   name: string;
//   score: number;
//   thumbnail: StaticImageData;
// }

// const TeamItem: React.FC<TeamItemProps> = ({ rank, name, score, thumbnail }) => (
//   <div className={styles.teamItem}>
//     <span className={styles.rank}>{rank}</span>
//     <span className={styles.name}>{name}</span>
//     <span className={styles.score}>{score}</span>
//   </div>
// );

interface FinalRankingScreenProps {
  gameId: string;
}

const FinalRankingScreen: React.FC<FinalRankingScreenProps> = ({ gameId }) => {
  const { rankingColumns, showConfetti, currentTopThreeIndex } = useRankingAnimation();

  // 元のuseState、useEffect、useMemoはuseRankingAnimationフックに移動したため削除

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
          <img
            src={Confetti.src} // StaticImageData オブジェクトではないため .src を使用
            alt="Confetti"
            className={styles.confettiImage}
          />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <Image
            src={RankingResultTitleContainer} // StaticImageData オブジェクトではないため .src を使用
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
                    {/* トップ3の表示制御は isVisible で行う */}
                    {team.isVisible ? (
                      <RankingItemGorgeous
                        rank={team.rank}
                        name={team.name}
                        score={team.score}
                        thumbnail={team.thumbnail} // thumbnail を渡す
                      />
                    ) : (
                      null // プレースホルダーをレンダリングしない
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
                      // thumbnail={team.thumbnail} // RankingItemNormal に thumbnail は不要な想定
                    />
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
        {currentTopThreeIndex >= 1 && currentTopThreeIndex <=4 && currentTopThreeIndex !== -1 && ( /* Show prompt when ready for key input or during top 3 reveal */
          <div className={styles.keyboardPrompt}>
            <p>▶ キーで次へ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalRankingScreen; 