import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/app/_lib/firebase/FirebaseInitializer';
import BackgroundWideGray from '@/app/_images/BackgroundWideGray.png';
import Confetti from '@/app/_images/Confetti.png';
import RankingResultTitleContainer from '@/app/_images/RankingResultTitleContainer.png';
import RankingItemNormal from './RankingItemNormal';
import RankingItemGorgeous from './RankingItemGorgeous';
import styles from './FinalRankingScreen.module.scss';
import { useRankingAnimation, Team } from './useRankingAnimation'; // Team型をインポート

// サムネイル画像のインポートは不要になるため削除
// import ThumbnailTeamA from '@/app/_images/ThumbnailTeamA.jpg';
// ... (他のサムネイルインポートも削除)
// import ThumbnailTeamO from '@/app/_images/ThumbnailTeamO.jpg';

// モックデータは削除
// const mockTeams = [
//   { name: "チームA", score: 1000, thumbnail: ThumbnailTeamA },
//   ... (他のモックチームデータも削除)
//   { name: "チームO", score: 100, thumbnail: ThumbnailTeamO },
// ];

interface FinalRankingScreenProps {
  gameId: string;
}

const FinalRankingScreen: React.FC<FinalRankingScreenProps> = ({ gameId }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useRankingAnimationフックにteamsを渡す
  const { rankingColumns, showConfetti, currentTopThreeIndex } = useRankingAnimation(teams);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!gameId) {
        setIsLoading(false);
        setError("Game ID is not provided.");
        return;
      }
      setIsLoading(true);
      setError(null);
      const db = getFirestore(firebaseApp);
      try {
        const usersCollectionRef = collection(db, 'Games', gameId, 'Users');
        const q = query(usersCollectionRef, orderBy('score', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedTeams: Team[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // FirestoreのドキュメントIDをidとして使用し、name, score, thumbnailを期待通りに設定
          // thumbnailはstring URLであることを想定
          fetchedTeams.push({
            name: data.name as string,
            score: data.score as number,
            thumbnail: data.thumbnail as string, // FirestoreからはURL文字列が来る想定
          });
        });
        setTeams(fetchedTeams);
      } catch (e) {
        console.error("Error fetching teams from Firestore:", e);
        setError("Failed to load ranking data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [gameId]);

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading ranking...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>Error: {error}</div>;
  }

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
            src={Confetti.src} alt="Confetti"
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
              {column.map((team) => ( // team は TeamWithVisibility 型のはず
                team.rank <= 3 ? (
                  <div key={team.name} className={styles.rankingItemWrapper}>
                    {team.isVisible ? (
                      <RankingItemGorgeous
                        rank={team.rank}
                        name={team.name}
                        score={team.score}
                        thumbnail={team.thumbnail} // thumbnail は string URL
                      />
                    ) : (
                      null
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
                      // thumbnail={team.thumbnail} // RankingItemNormal には thumbnail props がない想定だったが、もし必要なら渡す
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