import { useState, useEffect, useMemo } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { firebaseApp } from "@/app/_lib/firebase/FirebaseInitializer";
import { Game } from "@/app/_types";
import { useRouter } from "next/navigation";
// StaticImageData は string に変更するので不要になります
// import { StaticImageData } from 'next/image';

// サムネイル画像のインポートは FinalRankingScreen.tsx で行うか、URLを直接使うため削除
// import ThumbnailTeamA from '@/app/_images/ThumbnailTeamA.jpg';
// ... (他のサムネイルインポートも同様に削除)
// import ThumbnailTeamO from '@/app/_images/ThumbnailTeamO.jpg';

// モックデータは削除し、代わりに props からチームデータを受け取る
// const mockTeamsData = [
//   { name: "チームA", score: 1000, thumbnail: ThumbnailTeamA },
//   ... (他のモックデータも削除)
//   { name: "チームO", score: 100, thumbnail: ThumbnailTeamO },
// ];

export interface Team {
  name: string;
  score: number;
  thumbnail: string; // StaticImageData から string に変更
  itemAffectedScore?: number; // アイテム効果適用前のスコア（ボムアイテム用）
}

interface RankedTeam extends Team {
  rank: number;
}

interface TeamWithVisibility extends RankedTeam {
  isVisible: boolean;
}

export const useRankingAnimation = (teamsData: Team[], gameId: string) => {
  // gameIdパラメータを追加
  const router = useRouter();
  const [visibleTeams, setVisibleTeams] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentTopThreeIndex, setCurrentTopThreeIndex] = useState(-1);
  const [ranksToAnimate, setRanksToAnimate] = useState<number[]>([]);
  const [isDrumrollPlaying, setIsDrumrollPlaying] = useState(false);

  const sortedTeams: RankedTeam[] = useMemo(() => {
    // mockTeamsData を props の teamsData に変更
    const teams = teamsData
      .sort((a, b) => {
        // 1. 最終スコア（score）で比較
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        // 2. スコアが同じ場合、itemAffectedScoreで比較
        const aItemScore = a.itemAffectedScore ?? a.score;
        const bItemScore = b.itemAffectedScore ?? b.score;
        if (bItemScore !== aItemScore) {
          return bItemScore - aItemScore;
        }

        // 3. それでも同じ場合、名前順で比較
        return a.name.localeCompare(b.name);
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1,
      }));
    return teams;
  }, [teamsData]);

  // FirestoreのfinalRankingStatus更新関数
  const updateGameStatus = async (
    finalRankingStatus: Game["finalRankingStatus"]
  ) => {
    if (!gameId) return;

    try {
      const db = getFirestore(firebaseApp);
      const gameRef = doc(db, "Games", gameId);
      await updateDoc(gameRef, { finalRankingStatus });
      console.log(
        `[Status Update] Game finalRankingStatus updated to: ${finalRankingStatus}`
      );
    } catch (error) {
      console.error(
        "[Status Update] Error updating game finalRankingStatus:",
        error
      );
    }
  };

  // currentTopThreeIndexに基づいてFirestoreのfinalRankingStatusを更新
  useEffect(() => {
    const updateStatusBasedOnTopThreeIndex = async () => {
      switch (currentTopThreeIndex) {
        case 4:
          await updateGameStatus("awaiting_third_place");
          break;
        case 3:
          await updateGameStatus("awaiting_second_place");
          break;
        case 2:
          await updateGameStatus("awaiting_first_place");
          break;
        case 1:
          await updateGameStatus("announcing_winner");
          break;
        default:
          break;
      }
    };

    if (currentTopThreeIndex >= 1) {
      updateStatusBasedOnTopThreeIndex();
    }
  }, [currentTopThreeIndex, showConfetti, gameId, updateGameStatus]);

  useEffect(() => {
    const initialRanks = sortedTeams
      .filter((team) => team.rank >= 4 && team.rank <= 15)
      .map((team) => team.rank)
      .sort((a, b) => b - a);
    setRanksToAnimate(initialRanks);
  }, [sortedTeams]);

  useEffect(() => {
    if (ranksToAnimate.length === 0) {
      const isAnimationDone =
        sortedTeams.length > 0 &&
        (sortedTeams.length < 4 ||
          visibleTeams.includes(
            sortedTeams.find((t) => t.rank === 4)?.rank ?? -1000
          ));

      if (isAnimationDone && currentTopThreeIndex === -1) {
        setCurrentTopThreeIndex(4);
      }
      return;
    }

    const interval = setInterval(() => {
      setRanksToAnimate((prevRanks) => {
        if (prevRanks.length > 0) {
          const rankToShow = prevRanks[0];
          setVisibleTeams((prevVisible) => {
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

  // ヘルパー関数: ドラムロールを停止
  const stopDrumroll = () => {
    const audioElements = document.getElementsByTagName("audio");
    for (let i = 0; i < audioElements.length; i++) {
      if (audioElements[i].src.includes("drumroll.mp3")) {
        audioElements[i].pause();
        audioElements[i].currentTime = 0;
      }
    }
    setIsDrumrollPlaying(false);
  };

  // ヘルパー関数: 初期状態にリセット
  const resetToInitial = () => {
    setCurrentTopThreeIndex(-1);
    setVisibleTeams([]);
    const initialRanks = sortedTeams
      .filter((team) => team.rank >= 4 && team.rank <= 15)
      .map((team) => team.rank)
      .sort((a, b) => b - a);
    setRanksToAnimate(initialRanks);
  };

  // ヘルパー関数: ドラムロールを開始
  const startDrumroll = () => {
    setIsDrumrollPlaying(true);
    const audio = new Audio("/sounds/drumroll.mp3");
    audio.play().catch((e) => {
      console.error("Error playing drumroll:", e);
      setCurrentTopThreeIndex(1);
      setTimeout(() => setShowConfetti(true), 1000); // 1位表示の1秒後に紙吹雪
      setIsDrumrollPlaying(false);
    });
    audio.onended = () => {
      if (currentTopThreeIndex === 2) {
        setCurrentTopThreeIndex(1);
        setTimeout(() => setShowConfetti(true), 1000); // 1位表示の1秒後に紙吹雪
      }
      setIsDrumrollPlaying(false);
    };
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        // 左矢印でランキング表示indexを前に戻す
        if (isDrumrollPlaying) {
          stopDrumroll();
          setCurrentTopThreeIndex(2);
        } else if (currentTopThreeIndex === 1) {
          setCurrentTopThreeIndex(2);
          setShowConfetti(false);
        } else if (currentTopThreeIndex >= 2 && currentTopThreeIndex <= 3) {
          setCurrentTopThreeIndex(currentTopThreeIndex + 1);
        } else if (currentTopThreeIndex === 4) {
          resetToInitial();
        }
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        // 右矢印またはEnterキーで次のフェーズへ進む
        if (currentTopThreeIndex >= 3 && currentTopThreeIndex <= 4) {
          setCurrentTopThreeIndex(currentTopThreeIndex - 1);
        } else if (currentTopThreeIndex === 2) {
          if (isDrumrollPlaying) {
            stopDrumroll();
            setCurrentTopThreeIndex(1);
            setTimeout(() => setShowConfetti(true), 1000); // 1位表示の1秒後に紙吹雪
          } else {
            startDrumroll();
          }
        }
      }
    };

    if (currentTopThreeIndex >= 1 && currentTopThreeIndex <= 4) {
      console.log(
        `[Effect KeyDownListener] Adding keydown listener. currentTopThreeIndex: ${currentTopThreeIndex}`
      );
      window.addEventListener("keydown", handleKeyDown);
    } else {
      console.log(
        `[Effect KeyDownListener] Not adding keydown listener or it's time to remove. currentTopThreeIndex: ${currentTopThreeIndex}`
      );
    }

    return () => {
      console.log(
        `[Effect KeyDownListener] Cleaning up keydown listener. currentTopThreeIndex: ${currentTopThreeIndex} (at time of cleanup)`
      );
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentTopThreeIndex,
    showConfetti,
    isDrumrollPlaying,
    router,
    sortedTeams,
  ]);

  const rankingColumns: TeamWithVisibility[][] = useMemo(() => {
    const visibleTeamsSet = new Set(visibleTeams);
    const topThreeIsVisible = (teamRank: number) => {
      // DEBUG LOG for rank 3 specifically
      if (teamRank === 3) {
        console.log(
          `[rankingColumns useMemo] Checking visibility for Rank 3. currentTopThreeIndex: ${currentTopThreeIndex}, Calculated isVisible: ${
            currentTopThreeIndex >= 1 &&
            currentTopThreeIndex <= 3 &&
            teamRank >= currentTopThreeIndex
          }`
        );
      }
      return (
        currentTopThreeIndex >= 1 &&
        currentTopThreeIndex <= 3 &&
        teamRank >= currentTopThreeIndex
      );
    };

    // DEBUG LOG
    console.log(
      `[rankingColumns useMemo] Calculating. currentTopThreeIndex: ${currentTopThreeIndex}, visibleTeams:`,
      Array.from(visibleTeamsSet)
    );

    const columns = [
      sortedTeams.slice(0, 3).map((team) => ({
        ...team,
        isVisible: topThreeIsVisible(team.rank),
      })),
      sortedTeams.slice(3, 9).map((team) => ({
        ...team,
        isVisible: visibleTeamsSet.has(team.rank),
      })),
      sortedTeams.slice(9, sortedTeams.length).map((team) => ({
        ...team,
        isVisible: visibleTeamsSet.has(team.rank),
      })),
    ];
    // DEBUG LOG for the visibility of top 3 teams
    console.log(
      "[rankingColumns useMemo] Top 3 teams visibility:",
      columns[0].map((t) => ({ rank: t.rank, isVisible: t.isVisible }))
    );
    return columns;
  }, [sortedTeams, visibleTeams, currentTopThreeIndex]);

  return { rankingColumns, showConfetti, currentTopThreeIndex };
};
