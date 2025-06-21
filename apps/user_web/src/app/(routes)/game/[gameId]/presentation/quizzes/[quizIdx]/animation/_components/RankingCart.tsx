"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./RankingCart.module.css";
import { AnimatedUser, ItemEvent } from "./types";
import { ExhaustParticles, DarkSmokeParticles } from "./RankingEffects";
import { CartDamageEffect } from "./CartDamageEffect";
import { KinokoService } from "./KinokoService";
import {
  getXPosition,
  getLaneYPosition,
  getAnimationSettings,
} from "./animationUtils";

interface RankingCartProps {
  user: AnimatedUser;
  index: number;
  thumbnail: string;
  isKillerAnimating: boolean;
  currentItemEvent: ItemEvent | undefined;
  playedRegularKinokoUserIds: string[]; // 演出完了した通常kinokoユーザー
  playedSpecialKinokoUserIds: string[]; // 演出完了したspecial_kinokoユーザー
  itemEvents?: ItemEvent[]; // kinoko系アイテムの詳細判定のため追加
  onDamageEffectEnd?: (userId: string) => void;
}

const RankingCart: React.FC<RankingCartProps> = ({
  user,
  index,
  thumbnail,
  isKillerAnimating,
  currentItemEvent,
  playedRegularKinokoUserIds,
  playedSpecialKinokoUserIds,
  itemEvents,
  onDamageEffectEnd,
}) => {
  const xPosition = getXPosition(user.animatedScore);
  const laneIndex = Math.min(index, 5);
  const animationSettings = getAnimationSettings(user);

  // チーム名の表示位置を決定（右端から見切れる場合は左側に表示）
  const shouldShowTeamNameOnLeft = xPosition > 70; // 70%を超えたら左側に表示

  // ダメージエフェクト終了ハンドラー
  const handleDamageEffectEnd = () => {
    if (onDamageEffectEnd) {
      onDamageEffectEnd(user.userId);
    }
  };

  // ユーザーが使用したkinoko系アイテムを特定
  const getUserKinokoItem = (): string | null => {
    if (!itemEvents) return null;
    const userKinokoEvent = itemEvents.find(
      (event) =>
        event.userId === user.userId &&
        KinokoService.isKinokoRelatedItem(event.itemId)
    );
    return userKinokoEvent ? userKinokoEvent.itemId : null;
  };

  const userKinokoItemId = getUserKinokoItem();

  return (
    <motion.div
      key={user.userId}
      className={`${styles.animatedCart} ${
        user.isPromotionFromBottom ? styles.promotionCart : ""
      } ${user.isDemotionToBottom ? styles.demotionCart : ""} ${
        user.isRankUp ? styles.rankUpCart : ""
      } ${user.isRankDown ? styles.rankDownCart : ""}`}
      initial={{
        marginLeft: `${xPosition}%`,
        top: user.isPromotionFromBottom && user.isAnimating 
          ? "100vh" 
          : `${getLaneYPosition(laneIndex) - 4}%`,
        ...animationSettings.initial,
      }}
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
        {/* チーム名表示（左側） */}
        {shouldShowTeamNameOnLeft && (
          <div
            className={`${styles.teamName} ${styles.teamNameLeft}`}
            style={{
              color: user.characterColor,
            }}
          >
            {user.teamName}
          </div>
        )}

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
              {/* きのこ系アイテムを使ったユーザーのカート右上にアイテム画像を表示（個別演出完了後のみ） */}
              {userKinokoItemId &&
                ((KinokoService.isRegularKinokoItem(userKinokoItemId) &&
                  playedRegularKinokoUserIds.includes(user.userId)) ||
                  (KinokoService.isSpecialKinokoItem(userKinokoItemId) &&
                    playedSpecialKinokoUserIds.includes(user.userId))) && (
                  <div className={styles.kinokoIcon}>
                    <Image
                      src={KinokoService.getKinokoImageUrl(userKinokoItemId)}
                      alt={
                        userKinokoItemId ===
                        KinokoService.getSpecialKinokoItemId()
                          ? "スペシャルきのこアイテム"
                          : "きのこアイテム"
                      }
                      width={40}
                      height={40}
                      className={styles.kinokoImage}
                    />
                    {/* kinoko不正解の場合、赤バツを表示 */}
                    {itemEvents &&
                      KinokoService.isKinokoIncorrectUser(
                        user.userId,
                        itemEvents
                      ) && (
                        <div className={styles.kinokoFailureBadge}>
                          <span className={styles.kinokoFailureX}>×</span>
                        </div>
                      )}
                  </div>
                )}
              <div className={styles.userThumbnailContainer}>
                <Image
                  src={thumbnail}
                  alt={user.teamName}
                  width={150}
                  height={150}
                  className={styles.userThumbnail}
                />
              </div>

              {/* ダメージエフェクト */}
              {user.damageEffect && (
                <CartDamageEffect
                  isVisible={user.damageEffect.isVisible}
                  itemId={user.damageEffect.itemId}
                  onEffectEnd={handleDamageEffectEnd}
                />
              )}
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

        {/* チーム名表示（右側） */}
        {!shouldShowTeamNameOnLeft && (
          <div
            className={styles.teamName}
            style={{
              color: user.characterColor,
            }}
          >
            {user.teamName}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RankingCart;
