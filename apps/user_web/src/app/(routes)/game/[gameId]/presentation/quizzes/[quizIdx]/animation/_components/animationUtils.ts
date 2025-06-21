
/** スコアの最大値（画面右端の基準） */
const MAX_SCORE = 1000;

/**
 * スコアに基づいてX軸位置を計算（0%〜85%の範囲）
 */
export const getXPosition = (score: number): number => {
  const cartWidthPercentage = 15;
  const maxLeftPercentage = 100 - cartWidthPercentage;
  const calculatedPosition = (score / MAX_SCORE) * maxLeftPercentage;
  return Math.max(0, Math.min(maxLeftPercentage, calculatedPosition));
};

/**
 * 表示ランクに基づいてY軸位置を計算（6レーン分割）
 */
export const getLaneYPosition = (displayRank: number): number => {
  const laneHeight = 100 / 6;
  const safeRank = Math.max(0, Math.min(5, displayRank));
  return safeRank * laneHeight;
};

/**
 * アニメーション設定を取得
 * 昇格・降格・順位上昇・順位下降・通常の5パターン
 */
export const getAnimationSettings = (user: {
  isPromotionFromBottom?: boolean;
  isDemotionToBottom?: boolean;
  isRankUp?: boolean;
  isRankDown?: boolean;
  isAnimating: boolean;
}) => {
  // 🚀 昇格アニメーション（下から上へ）
  if (user.isPromotionFromBottom && user.isAnimating) {
    return {
      initial: {
        opacity: 0.8,
        scale: 0.8
      },
      animate: {
        opacity: 1,
        scale: 1.05
      },
      transition: {
        top: { duration: 3.6, ease: "easeOut" },
        opacity: { duration: 1.2, ease: "easeOut" },
        scale: { duration: 0.6, ease: "easeOut" }
      }
    };
  }
  // 📉 降格アニメーション（上から下へ）
  if (user.isDemotionToBottom && user.isAnimating) {
    return {
      initial: {
        y: 0,
        opacity: 1,
        scale: 1
      },
      animate: {
        y: "60vh", // 下部エリアへ落下
        opacity: 0.6,
        scale: 0.9
      },
      transition: {
        y: { duration: 3.6, ease: "easeIn" },
        opacity: { duration: 2.4, ease: "easeIn" },
        scale: { duration: 1.6, ease: "easeIn" }
      }
    };
  }
  // 🔺 順位上昇アニメーション（上位6位内）
  if (user.isRankUp && user.isAnimating) {
    return {
      initial: {},
      animate: {
        scale: 1.1,
        y: -15,
        rotateZ: [-2, 2, -1, 0] // 軽い揺れ
      },
      transition: {
        scale: { duration: 0.8, ease: "easeOut" },
        y: { duration: 1.6, ease: "easeOut" },
        rotateZ: { duration: 1.2, ease: "easeInOut" }
      }
    };
  }
  // 🔻 順位下降アニメーション（上位6位内）
  if (user.isRankDown && user.isAnimating) {
    return {
      initial: {},
      animate: {
        scale: 0.95,
        y: 15,
        rotateZ: [1, -1, 0.5, 0] // 軽い振動
      },
      transition: {
        scale: { duration: 1.0, ease: "easeIn" },
        y: { duration: 2.0, ease: "easeIn" },
        rotateZ: { duration: 1.6, ease: "easeInOut" }
      }
    };
  }
  // 🎮 通常アニメーション
  return {
    initial: {},
    animate: {
      scale: user.isAnimating ? 1.05 : 1,
      y: user.isAnimating ? -10 : 0
    },
    transition: {
      scale: { duration: user.isAnimating ? 0.6 : 0, ease: "easeOut" },
      y: { duration: user.isAnimating ? 1.2 : 0, ease: "easeOut" }
    }
  };
};