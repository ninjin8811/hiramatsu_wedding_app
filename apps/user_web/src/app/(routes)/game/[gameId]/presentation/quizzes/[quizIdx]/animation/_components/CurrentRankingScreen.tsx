"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import styles from "./CurrentRanking.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { navigateToNextStep } from "../actions";
import { User, ItemEvent, AnimatedUser } from "./types";
import { TireTrail, SpeedLines } from "./RankingEffects";
import { useRankingAnimation } from "./useRankingAnimation";
import { MoviePlayer } from "./MoviePlayer";
import RankingCart from "./RankingCart";
import BottomRankingCart from "./BottomRankingCart";

export type { User } from "./types";

/** コンポーネントのProps */
interface CurrentRankingScreenProps {
  gameId: string;
  currentQuizIdx: number;
  users: Array<User>;
  itemEvents: Array<ItemEvent>;
}

const CurrentRankingScreen: React.FC<CurrentRankingScreenProps> = ({
  gameId,
  currentQuizIdx,
  users,
  itemEvents,
}) => {
  const router = useRouter();

  // カスタムフックを使用してアニメーションロジックを分離
  const {
    isGlobalAnimating,
    setIsGlobalAnimating,
    tireTrails,
    animationCompleted,
    animatedUsers,
    startAnimation,
    moviePlaybackState,
    playNextMovie,
    currentGroupedEvent,
    isKillerAnimating,
  } = useRankingAnimation({ users, itemEvents });

  // kinokoアイテムを使ったユーザーのIDを取得
  const kinokoUserIds = itemEvents
    .filter((event) => event.itemId === "kinoko")
    .map((event) => event.userId);

  // 再生完了したアイテムを追跡
  const [playedItems, setPlayedItems] = useState<Set<string>>(new Set());

  // kinokoの動画が再生完了したかチェック
  const hasKinokoMoviePlayed = playedItems.has("kinoko");

  // 動画再生完了後にのみ表示するkinokoユーザーのID
  const playedKinokoUserIds = hasKinokoMoviePlayed ? kinokoUserIds : [];

  // moviePlayerの動画終了を監視してplayedItemsを更新
  const handleMovieEnd = () => {
    if (currentGroupedEvent) {
      setPlayedItems((prev) => new Set(prev).add(currentGroupedEvent.itemName));
    }
    playNextMovie();
  };

  /**
   * アニメーション自動開始（2秒後）
   */
  useEffect(() => {
    if (!animationCompleted && !isGlobalAnimating) {
      const timer = setTimeout(() => {
        setIsGlobalAnimating(true);
        startAnimation();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [
    startAnimation,
    animationCompleted,
    isGlobalAnimating,
    setIsGlobalAnimating,
  ]);

  /**
   * キーボードナビゲーション
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (window.confirm("前の画面へ戻りますか?")) {
          router.back();
        }
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        // 動画再生中の場合はスキップ
        if (moviePlaybackState.isPlayingMovies) {
          playNextMovie();
        } else if (moviePlaybackState.allMoviesCompleted) {
          // 現在のスコア情報を抽出してナビゲート
          const usersScores = animatedUsers.map((user) => ({
            userId: user.userId,
            score: user.currentScore,
          }));
          navigateToNextStep(gameId, currentQuizIdx, usersScores);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    gameId,
    currentQuizIdx,
    router,
    moviePlaybackState,
    playNextMovie,
    animatedUsers,
  ]);

  // animatedScoreベースで並び順を決定（prev→currentへの変化をアニメーションで表現）
  const sortedUsers = animatedUsers.toSorted(
    (a, b) => b.animatedScore - a.animatedScore
  );

  // 7位以降の判定
  const otherUsers = sortedUsers.filter((user, index) => index >= 6);

  const getThumbnail = (user: AnimatedUser): string => {
    if (!isGlobalAnimating) {
      return user.thumbnail;
    }

    if (
      user.animatedScore < user.currentScore ||
      user.isRankUp ||
      user.isPromotionFromBottom
    ) {
      return user.smileThumbnail;
    } else if (
      user.animatedScore > user.currentScore ||
      user.isRankDown ||
      user.isDemotionToBottom
    ) {
      return user.sadThumbnail;
    }
    return user.thumbnail;
  };

  return (
    <main className={styles.bg}>
      {/* 全体スピードラインエフェクト */}
      <SpeedLines isActive={isGlobalAnimating} />

      {/* ヘッダー（ステージ背景） */}
      <div className={styles.header}>
        <Image
          src="/images/stage.png"
          alt="ステージの背景"
          width={3840}
          height={880}
          priority
        />
      </div>

      {/* メインランキングエリア（上位6位） */}
      <div className={styles.rankingArea}>
        <div className={styles.laneBorderTop}></div>
        <div className={styles.lanesContainer}>
          {/* 🛣️ レーン背景（6レーン） */}
          {Array.from({ length: 6 }, (_, laneIndex) => (
            <div
              key={`lane-bg-${laneIndex}`}
              className={`${styles.laneBackground} ${
                laneIndex === 5 ? styles.lastLane : ""
              }`}
            >
              <div className={styles.laneNumber}>
                <Image
                  src={`/images/lane/lane_${laneIndex + 1}.png`}
                  alt={`Lane ${laneIndex + 1}`}
                  width={100}
                  height={150}
                  className={styles.laneNumberImage}
                />
              </div>
            </div>
          ))}

          {/* タイヤ痕レイヤー */}
          <div className={styles.tireTrailLayer}>
            {tireTrails.map((trail, index) => (
              <TireTrail
                key={`${trail.userId}-${index}`}
                isActive={true}
                startX={trail.startX}
                endX={trail.endX}
                laneIndex={trail.laneIndex}
              />
            ))}
          </div>

          <div className={styles.cartsLayer}>
            <AnimatePresence>
              {/* 上位6位または降格アニメーション中のユーザーを表示 */}
              {sortedUsers
                .filter(
                  (user, index) =>
                    // 上位6位または降格アニメーション中
                    index < 6 || (user.isDemotionToBottom && user.isAnimating)
                )
                .map((user, index) => (
                  <RankingCart
                    key={user.userId}
                    user={user}
                    index={index}
                    thumbnail={getThumbnail(user)}
                    isKillerAnimating={isKillerAnimating}
                    currentItemEvent={currentGroupedEvent?.groupedEvents[0]}
                    kinokoUserIds={playedKinokoUserIds}
                  />
                ))}
            </AnimatePresence>
          </div>
        </div>
        <div className={styles.laneBorderBottom}></div>
      </div>

      {/* 下部ランキングエリア（7位以降） */}
      <div className={styles.bottomRankingArea}>
        <AnimatePresence>
          {otherUsers.map((user, index) => {
            const displayRankNumber = index + 7; // 7位から開始

            return (
              <BottomRankingCart
                key={user.userId}
                user={user}
                displayRankNumber={displayRankNumber}
                thumbnail={getThumbnail(user)}
                kinokoUserIds={playedKinokoUserIds}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* 動画プレイヤー */}
      <AnimatePresence>
        {currentGroupedEvent &&
          (() => {
            // グループ化されたアイテムイベントから複数のユーザー情報を取得
            const itemUserNames = currentGroupedEvent.userIds
              .map((userId: string) => {
                const user = animatedUsers.find((u) => u.userId === userId);
                return user?.teamName;
              })
              .filter(Boolean) as string[];

            // グループ化されたイベントから最初のイベントをitemEventとして渡す
            const firstEvent = currentGroupedEvent.groupedEvents[0];

            return (
              <MoviePlayer
                key={currentGroupedEvent.itemName}
                movieUrl={currentGroupedEvent.itemMovie}
                isVisible={
                  moviePlaybackState.isPlayingMovies && !isGlobalAnimating
                }
                onMovieEnd={handleMovieEnd}
                itemUserNames={itemUserNames}
                itemEvent={firstEvent}
              />
            );
          })()}
      </AnimatePresence>
    </main>
  );
};

export default CurrentRankingScreen;
