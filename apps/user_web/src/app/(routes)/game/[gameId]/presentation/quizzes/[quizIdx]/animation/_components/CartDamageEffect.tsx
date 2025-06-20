"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import styles from "./CartDamageEffect.module.css";

interface CartDamageEffectProps {
  isVisible: boolean;
  itemId: string;
  onEffectEnd: () => void;
}

export const CartDamageEffect: React.FC<CartDamageEffectProps> = ({
  isVisible,
  itemId,
  onEffectEnd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // item.idに基づいてWebM動画のURLを取得
  const getEffectVideoUrl = (itemId: string): string => {
    switch (itemId) {
      case "blue":
        return "/damage/blue.webm";
      case "bomb":
        return "/damage/bomb.webm";
      case "green":
        return "/damage/green.webm";
      default:
        return "/damage/blue.webm";
    }
  };

  const handleVideoEnd = () => {
    console.log("動画終了、エフェクト終了");
    onEffectEnd();
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("カートダメージエフェクト動画再生エラー:", e);
    onEffectEnd();
  };

  useEffect(() => {
    let isEffectActive = true;

    if (isVisible && videoRef.current) {
      const video = videoRef.current;

      // コンポーネントがまだアクティブな場合のみ再生開始
      const playVideo = async () => {
        try {
          if (isEffectActive && video) {
            console.log("動画再生開始");
            await video.play();
          }
        } catch (error) {
          // コンポーネントがアンマウントされた場合はエラーを無視
          if (isEffectActive) {
            console.error("カートダメージエフェクト動画再生開始エラー:", error);
            onEffectEnd();
          }
        }
      };

      playVideo();
    }

    // クリーンアップ関数：コンポーネントがアンマウントされる際にフラグを無効化
    return () => {
      isEffectActive = false;
    };
  }, [isVisible, onEffectEnd]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.effectContainer}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <video
          ref={videoRef}
          src={getEffectVideoUrl(itemId)}
          className={styles.effectVideo}
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          muted={false}
          playsInline
          preload="auto"
          loop={false}
        />
      </motion.div>
    </AnimatePresence>
  );
};
