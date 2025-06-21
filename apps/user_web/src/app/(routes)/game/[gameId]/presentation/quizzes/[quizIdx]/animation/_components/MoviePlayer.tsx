"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./MoviePlayer.module.css";
import { ItemEvent } from "./types";
import { KinokoService } from "./KinokoService";

interface MoviePlayerProps {
  movieUrl: string;
  isVisible: boolean;
  onMovieEnd: () => void;
  itemUsers?: Array<{
    userId: string;
    teamName: string;
    thumbnail: string;
  }>;
  itemEvent?: ItemEvent;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({
  movieUrl,
  isVisible,
  onMovieEnd,
  itemUsers,
  itemEvent,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // kinoko系アイテムかどうかを判定
  const isKinokoItem =
    itemEvent && KinokoService.isKinokoRelatedItem(itemEvent.itemId);

  // kinoko系アイテムの場合の表示時間を計算（ユーザー数 × 1 + 2秒）
  const kinokoDisplayDuration =
    isKinokoItem && itemUsers
      ? (itemUsers.length * 1 + 2) * 1000 // ミリ秒に変換
      : 0;

  const handleVideoEnd = () => {
    // kinoko系アイテムの場合はタイマーで制御するため、ここでは何もしない
    if (!isKinokoItem) {
      onMovieEnd();
    }
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("動画再生エラー:", e);
    setIsPlaying(false);
    // エラーが発生した場合も次に進む
    onMovieEnd();
  };

  const handlePlay = () => {
    setIsPlaying(true);
    videoRef.current?.play();
    console.log("動画再生開始");
  };

  const handlePause = () => {
    setIsPlaying(false);
    videoRef.current?.pause();
    console.log("動画再生停止");
  };

  // kinoko系アイテムの時間制御
  useEffect(() => {
    if (isVisible && isKinokoItem && kinokoDisplayDuration > 0) {
      console.log(
        `🍄 kinoko系アイテム動画表示時間: ${
          kinokoDisplayDuration / 1000
        }秒 (ユーザー数: ${itemUsers?.length})`
      );

      // 指定時間後に動画を終了
      timeoutRef.current = setTimeout(() => {
        console.log("🍄 kinoko系動画表示時間完了");
        onMovieEnd();
      }, kinokoDisplayDuration);
    }

    // クリーンアップ
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    isVisible,
    isKinokoItem,
    kinokoDisplayDuration,
    onMovieEnd,
    itemUsers?.length,
  ]);

  if (!isVisible) return null;

  return (
    <motion.div
      className={styles.movieOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <video
        ref={videoRef}
        src={movieUrl}
        className={styles.movieVideo}
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        onPlay={handlePlay}
        onPause={handlePause}
        muted={false}
        playsInline
        preload="auto"
        autoPlay
        loop={isKinokoItem} // kinoko系アイテムの場合はループ再生
      ></video>

      {/* アイテム使用者の情報表示（左上） */}
      {itemUsers && itemUsers.length > 0 && (
        <div
          className={
            itemUsers.length === 1
              ? styles.itemUserInfoSingle
              : styles.itemUserInfo
          }
        >
          <div
            className={styles.itemUsersContainer}
            data-user-count={
              itemUsers.length <= 12 ? itemUsers.length : undefined
            }
            data-user-count-many={itemUsers.length > 12 ? "true" : undefined}
          >
            {itemUsers.map((user, index) => (
              <div key={user.userId} className={styles.itemUserName}>
                <Image
                  src={user.thumbnail}
                  alt={user.teamName}
                  width={40}
                  height={40}
                  className={styles.itemUserThumbnail}
                />
                <span className={styles.itemUserTeamName}>{user.teamName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* playが止まった時用 */}
      {!isPlaying && (
        <div className={styles.playbackInfo}>
          <p>Playing: {isPlaying ? "Yes" : "No"}</p>
          <button onClick={handlePlay}>Play</button>
        </div>
      )}
    </motion.div>
  );
};
