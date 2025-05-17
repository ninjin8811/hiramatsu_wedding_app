import { useState, useEffect, useMemo } from 'react';
import { StaticImageData } from 'next/image';

// サムネイル画像をインポート (FinalRankingScreen.tsxから移動)
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

// モックデータ（スコアのみ） (FinalRankingScreen.tsxから移動)
const mockTeamsData = [
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

interface Team {
  name: string;
  score: number;
  thumbnail: StaticImageData;
}

interface RankedTeam extends Team {
  rank: number;
}

interface TeamWithVisibility extends RankedTeam {
  isVisible: boolean;
}

export const useRankingAnimation = () => {
  const [visibleTeams, setVisibleTeams] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentTopThreeIndex, setCurrentTopThreeIndex] = useState(-1); // -1:初期, 3:3位, 2:2位, 1:1位
  const [ranksToAnimate, setRanksToAnimate] = useState<number[]>([]);

  const sortedTeams: RankedTeam[] = useMemo(() => {
    const teams = mockTeamsData
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.name.localeCompare(b.name);
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1,
      }));
    // console.log("Sorted Teams:", teams); 
    return teams;
  }, []);

  // ranksToAnimate を初期化
  useEffect(() => {
    const initialRanks = sortedTeams
      .filter(team => team.rank >= 4 && team.rank <= 15)
      .map(team => team.rank)
      .sort((a, b) => b - a); // 15位から4位の順に
    setRanksToAnimate(initialRanks);
    // console.log("Initial Ranks to animate (4-15):", initialRanks);
  }, [sortedTeams]);

  // 4-15位のチームを順番に表示（下の順位から）
  useEffect(() => {
    if (ranksToAnimate.length === 0) {
      // sortedTeams がロードされ、4-15位のアニメーションが完了しているかをチェック
      const isAnimationDone = sortedTeams.length > 0 &&
                             (sortedTeams.length < 4 || visibleTeams.includes(sortedTeams.find(t => t.rank === 4)?.rank ?? -1000));

      if (isAnimationDone && currentTopThreeIndex === -1) { // currentTopThreeIndexが初期状態(-1)の場合のみ実行
        // 4-15位の表示が完了したら、3秒待ってから3位表示の準備完了
        const timer = setTimeout(() => {
          console.log("Setting currentTopThreeIndex to 3 (ready for keyboard nav)"); // ★ログ追加
          setCurrentTopThreeIndex(3); // 3位から開始可能な状態
        }, 3000);
        return () => clearTimeout(timer);
      }
      return; // ranksToAnimateが空でも、まだアニメーション完了でない場合や、既にtop3処理が始まっている場合は何もしない
    }

    const interval = setInterval(() => {
      setRanksToAnimate(prevRanks => {
        if (prevRanks.length > 0) {
          const rankToShow = prevRanks[0];
          setVisibleTeams(prevVisible => {
            if (!prevVisible.includes(rankToShow)) { // 重複追加を防ぐ
              // console.log("Updating visibleTeams with:", rankToShow, "Remaining ranks:", prevRanks.slice(1));
              return [...prevVisible, rankToShow];
            }
            return prevVisible;
          });
          return prevRanks.slice(1); // 表示したランクをリストから削除
        }
        return prevRanks;
      });
    }, 500);

    // ranksToAnimate が空になったらインターバルをクリア
    // この条件は setInterval の中で ranksToAnimate が更新された後に評価されるべきなので、
    // setRanksToAnimate のコールバック内や、useEffectのreturn関数でのクリアがより適切です。
    // ただし、現在のロジックでは ranksToAnimate が空になると上の if (ranksToAnimate.length === 0) に入るため、
    // このインターバル自体が再設定されないので、大きな問題にはなりにくいですが、よりクリーンにするなら見直しの余地あり。
    if (ranksToAnimate.length === 0) { // このチェックは実質的に次のインターバル設定を止める役割
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [ranksToAnimate, sortedTeams, visibleTeams, currentTopThreeIndex]); // currentTopThreeIndex も依存配列に追加

  // 3位から1位の表示 (キーボード操作)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (currentTopThreeIndex > 1) {
          setCurrentTopThreeIndex(prev => prev - 1);
        } else if (currentTopThreeIndex === 1) { // 1位が表示された
          if (!showConfetti) { // 紙吹雪がまだ表示されていない場合のみ実行
            setTimeout(() => {
              setShowConfetti(true);
            }, 1000);
          }
        }
      }
    };

    if (currentTopThreeIndex >= 1 && currentTopThreeIndex <=3) { // 3位から1位の表示中のみリスナーを有効化
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTopThreeIndex, showConfetti]);


  const rankingColumns: TeamWithVisibility[][] = useMemo(() => {
    const visibleTeamsSet = new Set(visibleTeams);
    const topThreeActuallyVisibleRank = currentTopThreeIndex;

    return [
      sortedTeams.slice(0, 3).map(team => ({
        ...team,
        isVisible: topThreeActuallyVisibleRank !== -1 && team.rank >= topThreeActuallyVisibleRank
      })),
      sortedTeams.slice(3, 9).map(team => ({
        ...team,
        isVisible: visibleTeamsSet.has(team.rank)
      })),
      sortedTeams.slice(9, sortedTeams.length).map(team => ({ // sortedTeams.length を使う
        ...team,
        isVisible: visibleTeamsSet.has(team.rank)
      }))
    ];
  }, [sortedTeams, visibleTeams, currentTopThreeIndex]);

  return { rankingColumns, showConfetti, currentTopThreeIndex };
}; 