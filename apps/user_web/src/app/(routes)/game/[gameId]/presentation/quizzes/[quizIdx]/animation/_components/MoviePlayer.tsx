"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import styles from "./MoviePlayer.module.css";
import { ItemEvent } from "./types";

interface MoviePlayerProps {
  movieUrl: string;
  isVisible: boolean;
  onMovieEnd: () => void;
  itemUserNames?: string[];
  itemEvent?: ItemEvent;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({
  movieUrl,
  isVisible,
  onMovieEnd,
  itemUserNames,
  itemEvent,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 動画サイズを変更する条件を判定
  const shouldUseSpecialSize =
    itemEvent &&
    (itemEvent.itemName === "kinoko" ||
      itemEvent.effect.effectType === "conditional_bonus");

  const handleVideoEnd = () => {
    onMovieEnd();
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
        className={
          shouldUseSpecialSize ? styles.movieVideoSpecial : styles.movieVideo
        }
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        onPlay={handlePlay}
        onPause={handlePause}
        muted={false}
        playsInline
        preload="auto"
        autoPlay
      ></video>

      {/* アイテム使用者の情報表示（左上） */}
      {itemUserNames && itemUserNames.length > 0 && (
        <div
          className={
            itemUserNames.length === 1
              ? styles.itemUserInfoSingle
              : styles.itemUserInfo
          }
        >
          <div className={styles.itemUsersContainer}>
            {itemUserNames.map((userName, index) => (
              <div key={index} className={styles.itemUserName}>
                {userName}
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
