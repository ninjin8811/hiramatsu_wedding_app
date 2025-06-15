"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CurrentRanking.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { navigateToNextStep } from "../actions";
import { User, ItemEvent, AnimatedUser } from "./types";
import {
  ExhaustParticles,
  DarkSmokeParticles,
  TireTrail,
  SpeedLines,
} from "./RankingEffects";
import {
  getXPosition,
  getLaneYPosition,
  getAnimationSettings,
} from "./animationUtils";
import { useRankingAnimation } from "./useRankingAnimation";
import { MoviePlayer } from "./MoviePlayer";

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
  } = useRankingAnimation({ users, itemEvents });

  const getThumbnail = (user: AnimatedUser): string => {
    if (!isGlobalAnimating) {
      return user.thumbnail;
    }

    if (
      user.animatedScore <= user.currentScore ||
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

  // 現在再生中の動画
  const currentMovie =
    moviePlaybackState.isPlayingMovies &&
    itemEvents[moviePlaybackState.currentMovieIndex]
      ? itemEvents[moviePlaybackState.currentMovieIndex]
      : null;

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
                .map((user, index) => {
                  const xPosition = getXPosition(user.animatedScore);
                  // currentScoreベースでのレーン位置を計算
                  const laneIndex = Math.min(index, 5);

                  const animationSettings = getAnimationSettings(user);

                  return (
                    <motion.div
                      key={user.userId}
                      className={`${styles.animatedCart} ${
                        user.isPromotionFromBottom ? styles.promotionCart : ""
                      } ${user.isDemotionToBottom ? styles.demotionCart : ""} ${
                        user.isRankUp ? styles.rankUpCart : ""
                      } ${user.isRankDown ? styles.rankDownCart : ""}`}
                      initial={animationSettings.initial}
                      animate={{
                        marginLeft: `${xPosition}%`,
                        top: `${getLaneYPosition(laneIndex) - 4}%`,
                        ...animationSettings.animate,
                      }}
                      transition={{
                        marginLeft: {
                          duration: user.isAnimating ? 3.0 : 0,
                          ease: "easeOut",
                        },
                        top: {
                          duration: user.isAnimating ? 2.4 : 0,
                          ease: "easeOut",
                        },
                        ...animationSettings.transition,
                      }}
                    >
                      {/* 💨 パーティクルエフェクト（通常・上昇・下降・降格用） */}
                      <div style={{ position: "relative" }}>
                        {user.isDemotionToBottom || user.isRankDown ? (
                          <DarkSmokeParticles isActive={user.isAnimating} />
                        ) : (
                          <ExhaustParticles
                            isActive={user.isAnimating}
                            color={user.characterColor}
                          />
                        )}
                      </div>

                      {/* 昇格エフェクト */}
                      {user.isPromotionFromBottom && user.isAnimating && (
                        <div className={styles.promotionEffect}>
                          <div className={styles.promotionGlow}></div>
                          <div className={styles.promotionTrail}></div>
                        </div>
                      )}

                      {/* 降格エフェクト */}
                      {user.isDemotionToBottom && user.isAnimating && (
                        <div className={styles.demotionEffect}>
                          <div className={styles.demotionShadow}></div>
                          <div className={styles.demotionTrail}></div>
                        </div>
                      )}

                      {/* カート画像とスコア吹き出し */}
                      <div className={styles.cartWithScore}>
                        <div className={styles.cartContainer}>
                          <Image
                            src={user.cartImage}
                            alt={`${index + 1}位`}
                            width={180}
                            height={100}
                            className={`${styles.cartImage} ${
                              user.isAnimating ? styles.cartMoving : ""
                            } ${
                              user.isPromotionFromBottom
                                ? styles.cartPromotion
                                : ""
                            } ${
                              user.isDemotionToBottom ? styles.cartDemotion : ""
                            } ${user.isRankUp ? styles.cartRankUp : ""} ${
                              user.isRankDown ? styles.cartRankDown : ""
                            }`}
                          />
                          <div className={styles.userThumbnailContainer}>
                            <Image
                              src={getThumbnail(user)}
                              alt={user.teamName}
                              width={150}
                              height={150}
                              className={styles.userThumbnail}
                            />
                          </div>
                        </div>
                        <motion.div
                          className={`${styles.scoreBubble} ${
                            user.isAnimating ? styles.animatingScore : ""
                          } ${
                            user.isPromotionFromBottom
                              ? styles.promotionScore
                              : ""
                          } ${
                            user.isDemotionToBottom ? styles.demotionScore : ""
                          } ${user.isRankUp ? styles.rankUpScore : ""} ${
                            user.isRankDown ? styles.rankDownScore : ""
                          }`}
                          style={{
                            backgroundColor: `rgba(${parseInt(
                              user.characterColor.slice(1, 3),
                              16
                            )}, ${parseInt(
                              user.characterColor.slice(3, 5),
                              16
                            )}, ${parseInt(
                              user.characterColor.slice(5, 7),
                              16
                            )}, 0.8)`,
                          }}
                          animate={{
                            scale: user.isAnimating ? 1.1 : 1,
                          }}
                          transition={{
                            duration: user.isAnimating ? 0.6 : 0,
                            ease: "easeOut",
                          }}
                        >
                          {user.animatedScore}
                          <span>pt</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
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
              <motion.div
                key={user.userId}
                className={styles.bottomRankItem}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.3 },
                }}
              >
                <div className={styles.bottomRankNumber}>
                  <Image
                    src={`/images/current_ranking_numbers/number_${displayRankNumber}.png`}
                    alt={`Rank ${displayRankNumber}`}
                    width={39}
                    height={47}
                  />
                </div>

                <div className={styles.bottomCartImageContainer}>
                  <div
                    className={`${styles.bottomCartContainer} ${
                      user.isAnimating ? styles.cartMoving : ""
                    }`}
                  >
                    <Image
                      src={user.cartImage}
                      alt={`${displayRankNumber}位`}
                      width={130}
                      height={139}
                      className={styles.bottomCartImage}
                    />
                    <div className={styles.bottomUserThumbnailContainer}>
                      <Image
                        src={getThumbnail(user)}
                        alt={user.teamName}
                        width={30}
                        height={30}
                        className={styles.bottomUserThumbnail}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 動画プレイヤー */}
      <AnimatePresence>
        {currentMovie && (
          <MoviePlayer
            key={currentMovie.userId}
            movieUrl={currentMovie.itemMovie}
            isVisible={moviePlaybackState.isPlayingMovies && !isGlobalAnimating}
            onMovieEnd={playNextMovie}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default CurrentRankingScreen;
