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
  const [currentTopThreeIndex, setCurrentTopThreeIndex] = useState(-1); 
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
    return teams;
  }, []);

  useEffect(() => {
    const initialRanks = sortedTeams
      .filter(team => team.rank >= 4 && team.rank <= 15)
      .map(team => team.rank)
      .sort((a, b) => b - a); 
    setRanksToAnimate(initialRanks);
  }, [sortedTeams]);

  useEffect(() => {
    if (ranksToAnimate.length === 0) {
      const isAnimationDone = sortedTeams.length > 0 &&
                             (sortedTeams.length < 4 || visibleTeams.includes(sortedTeams.find(t => t.rank === 4)?.rank ?? -1000));
      
      // DEBUG LOG
      console.log(`[Effect 4-15 Done] ranksToAnimate.length: ${ranksToAnimate.length}, isAnimationDone: ${isAnimationDone}, currentTopThreeIndex: ${currentTopThreeIndex}`);

      if (isAnimationDone && currentTopThreeIndex === -1) { 
        const timer = setTimeout(() => {
          // DEBUG LOG
          console.log("[Effect 4-15 Done] Timeout: Setting currentTopThreeIndex to 4 (ready for top 3 keyboard nav)");
          setCurrentTopThreeIndex(4); 
        }, 3000);
        return () => clearTimeout(timer);
      }
      return; 
    }

    const interval = setInterval(() => {
      setRanksToAnimate(prevRanks => {
        if (prevRanks.length > 0) {
          const rankToShow = prevRanks[0];
          setVisibleTeams(prevVisible => {
            if (!prevVisible.includes(rankToShow)) { 
              return [...prevVisible, rankToShow];
            }
            return prevVisible;
          });
          return prevRanks.slice(1); 
        }
        return prevRanks;
      });
    }, 500);

    if (ranksToAnimate.length === 0) { 
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [ranksToAnimate, sortedTeams, visibleTeams, currentTopThreeIndex]); 

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        // DEBUG LOG
        console.log(`[KeyDown] ArrowRight pressed. currentTopThreeIndex: ${currentTopThreeIndex}`);
        if (currentTopThreeIndex === 4) {      
          console.log("[KeyDown] Setting currentTopThreeIndex from 4 to 3");
          setCurrentTopThreeIndex(3);          
        } else if (currentTopThreeIndex === 3) { 
          console.log("[KeyDown] Setting currentTopThreeIndex from 3 to 2");
          setCurrentTopThreeIndex(2);          
        } else if (currentTopThreeIndex === 2) { 
          console.log("[KeyDown] Setting currentTopThreeIndex from 2 to 1");
          setCurrentTopThreeIndex(1);          
        } else if (currentTopThreeIndex === 1) { 
          console.log("[KeyDown] currentTopThreeIndex is 1. Checking confetti.");
          if (!showConfetti) { 
            setTimeout(() => {
              setShowConfetti(true);
            }, 1000);
          }
        }
      }
    };

    if (currentTopThreeIndex >= 1 && currentTopThreeIndex <= 4) { 
      console.log(`[Effect KeyDownListener] Adding keydown listener. currentTopThreeIndex: ${currentTopThreeIndex}`);
      window.addEventListener('keydown', handleKeyDown);
    } else {
      console.log(`[Effect KeyDownListener] Not adding keydown listener or it's time to remove. currentTopThreeIndex: ${currentTopThreeIndex}`);
    }

    return () => {
      console.log(`[Effect KeyDownListener] Cleaning up keydown listener. currentTopThreeIndex: ${currentTopThreeIndex} (at time of cleanup)`);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTopThreeIndex, showConfetti]);


  const rankingColumns: TeamWithVisibility[][] = useMemo(() => {
    const visibleTeamsSet = new Set(visibleTeams);
    const topThreeIsVisible = (teamRank: number) => {
      // DEBUG LOG for rank 3 specifically
      if (teamRank === 3) {
        console.log(`[rankingColumns useMemo] Checking visibility for Rank 3. currentTopThreeIndex: ${currentTopThreeIndex}, Calculated isVisible: ${currentTopThreeIndex >= 1 && currentTopThreeIndex <= 3 && teamRank >= currentTopThreeIndex}`);
      }
      return currentTopThreeIndex >= 1 && currentTopThreeIndex <= 3 && teamRank >= currentTopThreeIndex;
    };
    
    // DEBUG LOG
    console.log(`[rankingColumns useMemo] Calculating. currentTopThreeIndex: ${currentTopThreeIndex}, visibleTeams:`, Array.from(visibleTeamsSet));

    const columns = [
      sortedTeams.slice(0, 3).map(team => ({
        ...team,
        isVisible: topThreeIsVisible(team.rank)
      })),
      sortedTeams.slice(3, 9).map(team => ({
        ...team,
        isVisible: visibleTeamsSet.has(team.rank)
      })),
      sortedTeams.slice(9, sortedTeams.length).map(team => ({
        ...team,
        isVisible: visibleTeamsSet.has(team.rank)
      }))
    ];
    // DEBUG LOG for the visibility of top 3 teams
    console.log("[rankingColumns useMemo] Top 3 teams visibility:", columns[0].map(t => ({rank: t.rank, isVisible: t.isVisible})));
    return columns;
  }, [sortedTeams, visibleTeams, currentTopThreeIndex]);

  return { rankingColumns, showConfetti, currentTopThreeIndex };
}; 