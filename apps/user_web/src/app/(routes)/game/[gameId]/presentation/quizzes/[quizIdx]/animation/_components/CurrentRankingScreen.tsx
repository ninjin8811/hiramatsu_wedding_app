"use client"

import { useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"
import styles from "./CurrentRanking.module.css"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { navigateToNextStep, updateUsersScore } from "../actions"
import { User, ItemEvent, AnimatedUser } from "./types"
import { TireTrail, SpeedLines } from "./RankingEffects"
import { useRankingAnimation } from "./useRankingAnimation"
import { MoviePlayer } from "./MoviePlayer"
import RankingCart from "./RankingCart"
import BottomRankingCart from "./BottomRankingCart"
import { KinokoService } from "./KinokoService"

export type { User } from "./types"

/** コンポーネントのProps */
interface CurrentRankingScreenProps {
  gameId: string
  currentQuizIdx: number
  users: Array<User>
  itemEvents: Array<ItemEvent>
  totalQuestions: number // 総問題数を追加
}

const CurrentRankingScreen: React.FC<CurrentRankingScreenProps> = ({
  gameId,
  currentQuizIdx,
  users,
  itemEvents,
  totalQuestions,
}) => {
  const router = useRouter()

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
    handleDamageEffectEnd,
  } = useRankingAnimation({ users, itemEvents, totalQuestions, gameId })

  // kinoko系アイテムを使ったユーザーのIDを個別に取得
  const regularKinokoUserIds = KinokoService.getRegularKinokoUserIds(itemEvents)
  const specialKinokoUserIds = KinokoService.getSpecialKinokoUserIds(itemEvents)

  // 再生完了したアイテムを追跡
  const [playedItems, setPlayedItems] = useState<Set<string>>(new Set())

  // 演出完了後にのみ表示するkinokoユーザーのID（個別管理）
  const playedRegularKinokoUserIds = KinokoService.hasRegularKinokoMoviePlayed(
    playedItems,
  )
    ? regularKinokoUserIds
    : []
  const playedSpecialKinokoUserIds = KinokoService.hasSpecialKinokoMoviePlayed(
    playedItems,
  )
    ? specialKinokoUserIds
    : []

  // moviePlayerの動画終了を監視してplayedItemsを更新
  const handleMovieEnd = () => {
    if (currentGroupedEvent) {
      setPlayedItems((prev: Set<string>) =>
        new Set(prev).add(currentGroupedEvent.itemName),
      )
    }
    playNextMovie()
  }

  /**
   * アニメーション自動開始（2秒後）
   */
  useEffect(() => {
    if (!animationCompleted && !isGlobalAnimating) {
      const timer = setTimeout(() => {
        setIsGlobalAnimating(true)
        startAnimation()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [
    startAnimation,
    animationCompleted,
    isGlobalAnimating,
    setIsGlobalAnimating,
  ])

  useEffect(() => {
    // 現在のスコア情報を抽出して更新
    if (moviePlaybackState.allMoviesCompleted) {
      const usersScores = animatedUsers.map((user: AnimatedUser) => ({
        userId: user.userId,
        score: user.currentScore,
      }))
      updateUsersScore(gameId, usersScores)
    }
  }, [moviePlaybackState, animatedUsers, gameId])

  /**
   * キーボードナビゲーション
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (window.confirm("前の画面へ戻りますか?")) {
          router.back()
        }
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        // 動画再生中の場合はスキップ
        if (moviePlaybackState.isPlayingMovies) {
          playNextMovie()
        } else if (moviePlaybackState.allMoviesCompleted) {
          navigateToNextStep(gameId, currentQuizIdx)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    gameId,
    currentQuizIdx,
    router,
    moviePlaybackState,
    playNextMovie,
    animatedUsers,
  ])

  // animatedScoreベースで並び順を決定（prev→currentへの変化をアニメーションで表現）
  const sortedUsers = animatedUsers.toSorted(
    (a: AnimatedUser, b: AnimatedUser) => b.animatedScore - a.animatedScore,
  )

  // 6位以降の判定（昇格アニメーション中のユーザーは除外）
  const otherUsers = sortedUsers.filter(
    (user: AnimatedUser, index: number) =>
      index >= 5 && !(user.isPromotionFromBottom && user.isAnimating),
  )

  const getThumbnail = (user: AnimatedUser): string => {
    if (!isGlobalAnimating) {
      return user.thumbnail
    }

    if (
      user.animatedScore < user.currentScore ||
      user.isRankUp ||
      user.isPromotionFromBottom
    ) {
      return user.smileThumbnail
    } else if (
      user.animatedScore > user.currentScore ||
      user.isRankDown ||
      user.isDemotionToBottom
    ) {
      return user.sadThumbnail
    }
    return user.thumbnail
  }

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
          {/* 🛣️ レーン背景（5レーン） */}
          {Array.from({ length: 5 }, (_, laneIndex) => (
            <div
              key={`lane-bg-${laneIndex}`}
              className={`${styles.laneBackground} ${
                laneIndex === 4 ? styles.lastLane : ""
              }`}>
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
              {/* 上位5位または降格アニメーション中のユーザーを表示 */}
              {sortedUsers
                .filter(
                  (user, index) =>
                    // 上位5位または降格・昇格アニメーション中
                    index < 5 ||
                    (user.isDemotionToBottom && user.isAnimating) ||
                    (user.isPromotionFromBottom && user.isAnimating),
                )
                .map((user, index) => (
                  <RankingCart
                    key={user.userId}
                    user={user}
                    index={index}
                    thumbnail={getThumbnail(user)}
                    isKillerAnimating={isKillerAnimating}
                    currentItemEvent={currentGroupedEvent?.groupedEvents[0]}
                    playedRegularKinokoUserIds={playedRegularKinokoUserIds}
                    playedSpecialKinokoUserIds={playedSpecialKinokoUserIds}
                    itemEvents={itemEvents}
                    onDamageEffectEnd={handleDamageEffectEnd}
                  />
                ))}
            </AnimatePresence>
          </div>
        </div>
        <div className={styles.laneBorderBottom}></div>
      </div>

      {/* 動画プレイヤー */}
      <AnimatePresence>
        {currentGroupedEvent &&
          (() => {
            // グループ化されたアイテムイベントから複数のユーザー情報を取得
            const itemUsers = currentGroupedEvent.userIds
              .map((userId: string) => {
                const user = animatedUsers.find((u) => u.userId === userId)
                return user
                  ? {
                      userId: user.userId,
                      teamName: user.teamName,
                      thumbnail: user.thumbnail,
                    }
                  : null
              })
              .filter(Boolean) as Array<{
              userId: string
              teamName: string
              thumbnail: string
            }>

            // グループ化されたイベントから最初のイベントをitemEventとして渡す
            const firstEvent = currentGroupedEvent.groupedEvents[0]

            return (
              <MoviePlayer
                key={currentGroupedEvent.itemName}
                movieUrl={currentGroupedEvent.itemMovie}
                isVisible={
                  moviePlaybackState.isPlayingMovies && !isGlobalAnimating
                }
                onMovieEnd={handleMovieEnd}
                itemUsers={itemUsers}
                itemEvent={firstEvent}
              />
            )
          })()}
      </AnimatePresence>
    </main>
  )
}

export default CurrentRankingScreen
