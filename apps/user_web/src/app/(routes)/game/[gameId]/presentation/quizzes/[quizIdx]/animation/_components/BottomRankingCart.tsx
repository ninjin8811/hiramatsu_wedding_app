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
  kinokoUserIds: string[];
  itemEvents?: ItemEvent[]; // kinoko系アイテムの詳細判定のため追加
  onDamageEffectEnd?: (userId: string) => void;
}

const BottomRankingCart: React.FC<BottomRankingCartProps> = ({
  user,
  displayRankNumber,
  thumbnail,
  kinokoUserIds,
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
          {KinokoService.isKinokoUser(user.userId, kinokoUserIds) &&
            userKinokoItemId && (
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
