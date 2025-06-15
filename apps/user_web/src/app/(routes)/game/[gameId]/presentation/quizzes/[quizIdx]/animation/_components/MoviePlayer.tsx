"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import styles from "./MoviePlayer.module.css";
import RankingCart from "./RankingCart";
import { AnimatedUser } from "./types";

interface MoviePlayerProps {
  movieUrl: string;
  isVisible: boolean;
  onMovieEnd: () => void;
  itemUser?: AnimatedUser;
  itemUserName?: string;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({
  movieUrl,
  isVisible,
  onMovieEnd,
  itemUser,
  itemUserName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        className={styles.movieVideo}
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
      {itemUser && itemUserName && (
        <div className={styles.itemUserInfo}>
          <div className={styles.itemUserCart}>
            <RankingCart user={itemUser} index={0} isGlobalAnimating={false} />
          </div>
          <div className={styles.itemUserName}>{itemUserName}</div>
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
