'use client';

import { motion } from 'framer-motion';
import styles from './CurrentRanking.module.css';

/**
 * 🚗 通常の排気ガスパーティクル
 * アニメーション中のカートから噴出する明るいパーティクル
 */
export const ExhaustParticles: React.FC<{ isActive: boolean; color: string }> = ({ isActive, color }) => {
  if (!isActive) return null;

  return (
    <div className={styles.exhaustContainer}>
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={i}
          className={styles.exhaustParticle}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.1}s`
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], x: [-20, -60, -100] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

/**
 * 🌫️ 降格用ダークスモークパーティクル
 * 順位が下がったカートから出る暗い煙のエフェクト
 */
export const DarkSmokeParticles: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className={styles.darkSmokeContainer}>
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={i}
          className={styles.darkSmokeParticle}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 1.8],
            y: [0, -30, -60],
            x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

/**
 * 🛞 タイヤ痕エフェクト
 * カートが移動した軌跡を表示する点線
 */
export const TireTrail: React.FC<{ isActive: boolean; startX: number; endX: number; laneIndex: number }> = ({
  isActive, startX, endX, laneIndex
}) => {
  if (!isActive || startX === endX) return null;

  return (
    <motion.div
      className={styles.tireTrail}
      style={{
        left: `${Math.min(startX, endX)}%`,
        width: `${Math.abs(endX - startX)}%`,
        top: `${laneIndex * (100/6) + 10}%`
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: [0, 0.8, 0] }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
  );
};

/**
 * ⚡ スピードラインエフェクト
 * 全体的なアニメーション中に画面を横切る線エフェクト
 */
export const SpeedLines: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className={styles.speedLinesContainer}>
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className={styles.speedLine}
          style={{
            top: `${5 + i * 7}%`,
            animationDelay: `${i * 0.05}s`
          }}
          initial={{ x: "100vw", opacity: 0 }}
          animate={{ x: "-100px", opacity: [0, 1, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};