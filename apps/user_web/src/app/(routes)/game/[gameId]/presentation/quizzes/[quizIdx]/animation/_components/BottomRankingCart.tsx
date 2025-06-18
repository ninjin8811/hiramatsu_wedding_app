"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./CurrentRanking.module.css";
import { AnimatedUser } from "./types";
import { CartDamageEffect } from "./CartDamageEffect";

interface BottomRankingCartProps {
  user: AnimatedUser;
  displayRankNumber: number;
  thumbnail: string;
  kinokoUserIds: string[];
  onDamageEffectEnd?: (userId: string) => void;
}

const BottomRankingCart: React.FC<BottomRankingCartProps> = ({
  user,
  displayRankNumber,
  thumbnail,
  kinokoUserIds,
  onDamageEffectEnd,
}) => {
  // ダメージエフェクト終了ハンドラー
  const handleDamageEffectEnd = () => {
    if (onDamageEffectEnd) {
      onDamageEffectEnd(user.userId);
    }
  };
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
          {kinokoUserIds.includes(user.userId) && (
            <div className={styles.kinokoIcon}>
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/fussa-wedding-app-prod/o/items%2Fkinoko.png?alt=media&token=8c042c21-f6fa-4375-b1fc-f4c7aa1d2ad7"
                alt="きのこアイテム"
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
