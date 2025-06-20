"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./CurrentRanking.module.css";
import { AnimatedUser, ItemEvent } from "./types";
import { CartDamageEffect } from "./CartDamageEffect";
import { KinokoService } from "./KinokoService";

interface BottomRankingCartProps {
  user: AnimatedUser;
  displayRankNumber: number;
  thumbnail: string;
  playedRegularKinokoUserIds: string[]; // 演出完了した通常kinokoユーザー
  playedSpecialKinokoUserIds: string[]; // 演出完了したspecial_kinokoユーザー
  itemEvents?: ItemEvent[]; // kinoko系アイテムの詳細判定のため追加
  onDamageEffectEnd?: (userId: string) => void;
}

const BottomRankingCart: React.FC<BottomRankingCartProps> = ({
  user,
  displayRankNumber,
  thumbnail,
  playedRegularKinokoUserIds,
  playedSpecialKinokoUserIds,
  itemEvents,
  onDamageEffectEnd,
}) => {
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
          {userKinokoItemId &&
            ((KinokoService.isRegularKinokoItem(userKinokoItemId) &&
              playedRegularKinokoUserIds.includes(user.userId)) ||
              (KinokoService.isSpecialKinokoItem(userKinokoItemId) &&
                playedSpecialKinokoUserIds.includes(user.userId))) && (
              <div className={styles.kinokoIcon}>
                <Image
                  src={KinokoService.getKinokoImageUrl(userKinokoItemId)}
                  alt={
                    userKinokoItemId === KinokoService.getSpecialKinokoItemId()
                      ? "スペシャルきのこアイテム"
                      : "きのこアイテム"
                  }
                  width={25}
                  height={25}
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
          <div className={styles.bottomUserThumbnailContainer}>
            <Image
              src={thumbnail}
              alt={user.teamName}
              width={30}
              height={30}
              className={styles.bottomUserThumbnail}
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
        </div>
      </div>
    </motion.div>
  );
};

export default BottomRankingCart;
