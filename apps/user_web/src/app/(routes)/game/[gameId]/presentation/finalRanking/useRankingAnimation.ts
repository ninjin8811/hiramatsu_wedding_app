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

  const sortedTeams: RankedTeam[] = useMemo(() => {
    return mockTeamsData
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
  }, []);

  // 4-15位のチームを順番に表示（下の順位から）
  useEffect(() => {
    const teams4to15Ranks = sortedTeams
      .filter(team => team.rank >= 4 && team.rank <= 15)
      .map(team => team.rank)
      .sort((a, b) => b - a); // 15位から4位の順に

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < teams4to15Ranks.length) {
        setVisibleTeams(prev => [...prev, teams4to15Ranks[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        // 4-15位の表示が完了したら、3秒待ってから3位表示の準備完了
        setTimeout(() => {
          setCurrentTopThreeIndex(3); // 3位から開始可能な状態
        }, 3000);
      }
    }, 500); // 0.5秒ごとに1チームずつ表示

    return () => clearInterval(interval);
  }, [sortedTeams]);

  // 3位から1位の表示 (キーボード操作)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (currentTopThreeIndex > 1) {
          setCurrentTopThreeIndex(prev => prev - 1);
        } else if (currentTopThreeIndex === 1) { // 1位が表示された
          // 1秒後に紙吹雪を表示
          setTimeout(() => {
            setShowConfetti(true);
          }, 1000);
        }
      }
    };

    if (currentTopThreeIndex >= 1 && currentTopThreeIndex <=3) { // 3位から1位の表示中のみリスナーを有効化
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTopThreeIndex]);


  const rankingColumns: TeamWithVisibility[][] = useMemo(() => {
    const visibleTeamsSet = new Set(visibleTeams);
    const topThreeActuallyVisibleRank = currentTopThreeIndex; // 3, 2, or 1

    return [
      sortedTeams.slice(0, 3).map(team => ({
        ...team,
        // currentTopThreeIndex が 3 なら 3位のみ表示, 2 なら 2,3位表示, 1 なら 1,2,3位表示
        isVisible: topThreeActuallyVisibleRank !== -1 && team.rank >= topThreeActuallyVisibleRank
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

  return { rankingColumns, showConfetti, currentTopThreeIndex };
}; 