'use client';

import { motion } from 'framer-motion';
import styles from './MoviePlayer.module.css';

interface MoviePlayerProps {
  movieUrl: string;
  isVisible: boolean;
  onMovieEnd: () => void;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({
  movieUrl,
  isVisible,
  onMovieEnd
}) => {
  const handleVideoEnd = () => {
    onMovieEnd();
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('動画再生エラー:', e);
    // エラーが発生した場合も次に進む
    onMovieEnd();
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
        src={movieUrl}
        className={styles.movieVideo}
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        muted={true}
        playsInline
        preload="auto"
        autoPlay
      >
      </video>
    </motion.div>
  );
};