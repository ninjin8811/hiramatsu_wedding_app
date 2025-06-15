"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./RankingCart.module.css";
import { AnimatedUser, ItemEvent } from "./types";
import { ExhaustParticles, DarkSmokeParticles } from "./RankingEffects";
import {
  getXPosition,
  getLaneYPosition,
  getAnimationSettings,
} from "./animationUtils";

interface RankingCartProps {
  user: AnimatedUser;
  index: number;
  isGlobalAnimating: boolean;
  isKillerAnimating: boolean;
  currentItemEvent: ItemEvent | undefined;
}

const RankingCart: React.FC<RankingCartProps> = ({
  user,
  index,
  isGlobalAnimating,
  isKillerAnimating,
  currentItemEvent,
}) => {
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

  const xPosition = getXPosition(user.animatedScore);
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
          {isKillerAnimating && user.userId === currentItemEvent?.userId ? (
            <video
              src="/images/carts/cart_killer.webm"
              autoPlay
              muted={false}
              loop
              width={280}
              height={200}
              className={`${styles.killerImage} ${
                user.isAnimating ? styles.cartMoving : ""
              } ${user.isPromotionFromBottom ? styles.cartPromotion : ""} ${
                user.isDemotionToBottom ? styles.cartDemotion : ""
              } ${user.isRankUp ? styles.cartRankUp : ""} ${
                user.isRankDown ? styles.cartRankDown : ""
              }`}
            />
          ) : (
            <>
              <Image
                src={user.cartImage}
                alt={`${index + 1}位`}
                width={180}
                height={100}
                className={`${styles.cartImage} ${
                  user.isAnimating ? styles.cartMoving : ""
                } ${user.isPromotionFromBottom ? styles.cartPromotion : ""} ${
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
            </>
          )}
        </div>
        <motion.div
          className={`${styles.scoreBubble} ${
            user.isAnimating ? styles.animatingScore : ""
          } ${user.isPromotionFromBottom ? styles.promotionScore : ""} ${
            user.isDemotionToBottom ? styles.demotionScore : ""
          } ${user.isRankUp ? styles.rankUpScore : ""} ${
            user.isRankDown ? styles.rankDownScore : ""
          } ${
            isKillerAnimating && user.userId === currentItemEvent?.userId
              ? styles.killerScore
              : ""
          }`}
          style={{
            backgroundColor: `rgba(${parseInt(
              user.characterColor.slice(1, 3),
              16
            )}, ${parseInt(user.characterColor.slice(3, 5), 16)}, ${parseInt(
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
};

export default RankingCart;
