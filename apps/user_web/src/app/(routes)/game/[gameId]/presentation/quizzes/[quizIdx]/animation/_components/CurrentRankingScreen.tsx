'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CurrentRanking.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { navigateToNextStep } from '../actions';

/** スコアの最大値（画面右端の基準） */
const MAX_SCORE = 900;

/** 基本的なユーザー情報 */
export interface User {
  userId: string;
  teamName: string;
  thumbnail: string;
  characterImage: string;
  characterColor: string;
  prevScore: number;
  currentScore: number;
}

/** コンポーネントのProps */
interface CurrentRankingScreenProps {
  gameId: string;
  currentQuizIdx: number;
  users: Array<User>;
}

/** アニメーション用に拡張されたユーザー情報 */
interface AnimatedUser extends User {
  animatedScore: number;           // アニメーション中の表示スコア
  isAnimating: boolean;            // アニメーション実行中フラグ
  finalRank: number;               // 最終的な順位（0ベース）
  currentDisplayRank: number;      // 現在の表示順位（0ベース）
  targetDisplayRank: number;       // 目標表示順位（0ベース）
  isPromotionFromBottom?: boolean; // 下位(7位以降)から上位(6位以内)への昇格フラグ
  isDemotionToBottom?: boolean;    // 上位(6位以内)から下位(7位以降)への降格フラグ
}

// ========================================
// 🎨 エフェクトコンポーネント
// ========================================
/**
 * 🚗 通常の排気ガスパーティクル
 * アニメーション中のカートから噴出する明るいパーティクル
 */
const ExhaustParticles: React.FC<{ isActive: boolean; color: string }> = ({ isActive, color }) => {
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
const DarkSmokeParticles: React.FC<{ isActive: boolean }> = ({ isActive }) => {
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
const TireTrail: React.FC<{ isActive: boolean; startX: number; endX: number; laneIndex: number }> = ({
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
const SpeedLines: React.FC<{ isActive: boolean }> = ({ isActive }) => {
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

// ========================================
// 🏁 メインコンポーネント
// ========================================
const CurrentRankingScreen: React.FC<CurrentRankingScreenProps> = ({
  gameId,
  currentQuizIdx,
  users = [],
}) => {
  const router = useRouter();

  /** 全体のアニメーションが実行中かどうか */
  const [isGlobalAnimating, setIsGlobalAnimating] = useState(false);


  /** タイヤ痕の表示データ */
  const [tireTrails, setTireTrails] = useState<Array<{
    userId: string;
    startX: number;
    endX: number;
    laneIndex: number
  }>>([]);

  /** アニメーション完了フラグ（重複実行防止） */
  const [animationCompleted, setAnimationCompleted] = useState(false);

  /**
   * 初期表示用のアニメーションデータを作成
   * prevScoreを基準にした順位で初期配置
   */
  const createInitialData = (): AnimatedUser[] => {
    // 前回スコア順でソート（初期配置用）
    const prevRanking = users.toSorted((a, b) => b.prevScore - a.prevScore);
    // 最終スコア順でソート（目標配置用）
    const finalRanking = users.toSorted((a, b) => b.currentScore - a.currentScore);

    return prevRanking.map((user, index) => {
      const finalRank = finalRanking.findIndex(u => u.userId === user.userId);
      return {
        ...user,
        animatedScore: user.prevScore,      // 初期表示はprevScore
        isAnimating: false,                 // 初期状態はアニメーションなし
        finalRank,                          // 最終的な順位
        currentDisplayRank: index,          // 現在の表示順位（0,1,2,3...）
        targetDisplayRank: finalRank,       // 目標の表示順位
        isPromotionFromBottom: false,       // 昇格フラグ初期化
        isDemotionToBottom: false          // 降格フラグ初期化
      };
    });
  };

  /** アニメーションするユーザーデータ */
  const [animatedUsers, setAnimatedUsers] = useState<AnimatedUser[]>(createInitialData);

  // ========================================
  // 🎯 ランク管理ロジック
  // ========================================
  /**
   * ユーザーの順位変更時に他のユーザーの順位を適切に調整する
   * レーンの重複を防ぎ、順位の整合性を保つ
   */
  const updateUserRanks = useCallback((users: AnimatedUser[], animatingUserId: string, newRank: number): AnimatedUser[] => {
    // アニメーション対象ユーザーの現在順位を取得
    const animatingUser = users.find(u => u.userId === animatingUserId);
    if (!animatingUser) return users;

    const oldRank = animatingUser.currentDisplayRank;

    return users.map(user => {
      if (user.userId === animatingUserId) {
        // アニメーション対象：新しい順位に設定
        return { ...user, currentDisplayRank: newRank };
      } else {
        // 他のユーザー：必要に応じて順位を調整
        let adjustedRank = user.currentDisplayRank;

        // 上位移動の場合（例：5位→1位）
        // 1-4位にいたユーザーは1つずつ下がる
        if (newRank < oldRank && user.currentDisplayRank >= newRank && user.currentDisplayRank < oldRank) {
          adjustedRank = user.currentDisplayRank + 1;
        }
        // 下位移動の場合（例：1位→3位）
        // 2-3位にいたユーザーは1つずつ上がる
        else if (newRank > oldRank && user.currentDisplayRank > oldRank && user.currentDisplayRank <= newRank) {
          adjustedRank = user.currentDisplayRank - 1;
        }

        return { ...user, currentDisplayRank: adjustedRank };
      }
    });
  }, []);

  // ========================================
  // 🎬 メインアニメーションロジック
  // ========================================
  /**
   * 段階的ランキングアニメーションの実行
   * 上位6位のスコア変化チームを順次アニメーション
   */
  const startAnimation = useCallback(async () => {
    // 重複実行防止
    if (animationCompleted) {
      console.log('🚫 Animation already completed, skipping...');
      return;
    }

    console.log('🎬 Starting ranking animation sequence...');
    setAnimationCompleted(true);

    // 最終順位を計算
    const finalRanking = users.toSorted((a, b) => b.currentScore - a.currentScore);

    // 上位6位のチームのうち、スコアが変化したチームのみ抽出
    const top6ChangedUsers = finalRanking
      .slice(0, 6) // 上位6位のみ
      .filter(user => user.prevScore !== user.currentScore); // スコア変化したもののみ

    console.log(`🎯 Found ${top6ChangedUsers.length} top-6 teams with score changes:`,
                top6ChangedUsers.map(u => `${u.teamName}(${u.prevScore}→${u.currentScore})`));

    // 各チームを順次アニメーション
    for (let i = 0; i < top6ChangedUsers.length; i++) {
      const userToAnimate = top6ChangedUsers[i];
      const finalRank = finalRanking.findIndex(u => u.userId === userToAnimate.userId);


      // タイヤ痕の軌跡を記録
      const startX = getXPosition(userToAnimate.prevScore);
      const endX = getXPosition(userToAnimate.currentScore);

      // 現在の表示順位と目標順位を取得
      const currentUser = animatedUsers.find(u => u.userId === userToAnimate.userId);
      const prevRank = currentUser?.currentDisplayRank || 0;
      const newRank = finalRank;

      // 特殊アニメーションの判定
      const isPromotionFromBottom = prevRank >= 6 && newRank < 6;  // 7位以降→6位以内
      const isDemotionToBottom = prevRank < 6 && newRank >= 6;     // 6位以内→7位以降

      console.log(`📊 ${userToAnimate.teamName}: ${prevRank}→${newRank} | ⬆️${isPromotionFromBottom} ⬇️${isDemotionToBottom}`);

      // アニメーション開始：順位調整とフラグ設定
      setAnimatedUsers(prev => {
        const updatedUsers = updateUserRanks(prev, userToAnimate.userId, newRank);
        return updatedUsers.map(user =>
          user.userId === userToAnimate.userId
            ? {
                ...user,
                isAnimating: true,
                targetDisplayRank: newRank,
                isPromotionFromBottom,
                isDemotionToBottom
              }
            : user
        );
      });

      // タイヤ痕エフェクトを追加
      const safePrevRank = Math.max(0, Math.min(5, prevRank));
      setTireTrails(prev => [...prev, {
        userId: userToAnimate.userId,
        startX,
        endX,
        laneIndex: safePrevRank
      }]);

      // スコアカウントアップアニメーション
      await new Promise<void>((resolve) => {
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3); // イージングアウト関数

          const startScore = userToAnimate.prevScore;
          const endScore = userToAnimate.currentScore;
          const currentScore = Math.round(startScore + (endScore - startScore) * easeOut);

          // リアルタイムでスコアを更新
          setAnimatedUsers(prev => prev.map(user =>
            user.userId === userToAnimate.userId
              ? { ...user, animatedScore: currentScore }
              : user
          ));

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // アニメーション完了：最終状態に設定
            setAnimatedUsers(prev => prev.map(user =>
              user.userId === userToAnimate.userId
                ? {
                    ...user,
                    animatedScore: userToAnimate.currentScore,
                    isAnimating: false,
                    currentDisplayRank: newRank,
                    isPromotionFromBottom: false, // フラグをリセット
                    isDemotionToBottom: false    // フラグをリセット
                  }
                : user
            ));
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });

      // 降格の場合は少し長めに待つ（落下アニメーションのため）
      const waitTime = isDemotionToBottom ? 800 : 500;

      // タイヤ痕をフェードアウト後削除
      setTimeout(() => {
        setTireTrails(prev => prev.filter(trail => trail.userId !== userToAnimate.userId));
      }, 2000);

      // 次のアニメーションまでのインターバル
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // 全アニメーション完了
    setIsGlobalAnimating(false);
  }, [users, updateUserRanks, animationCompleted, animatedUsers]);

  // ========================================
  // 🎯 位置計算ヘルパー関数
  // ========================================
  /**
   * スコアに基づいてX軸位置を計算（0%〜85%の範囲）
   */
  const getXPosition = (score: number) => {
    const cartWidthPercentage = 15;
    const maxLeftPercentage = 100 - cartWidthPercentage;
    const calculatedPosition = (score / MAX_SCORE) * maxLeftPercentage;
    return Math.max(0, Math.min(maxLeftPercentage, calculatedPosition));
  };

  /**
   * 表示ランクに基づいてY軸位置を計算（6レーン分割）
   */
  const getLaneYPosition = (displayRank: number) => {
    const laneHeight = 100 / 6;
    const safeRank = Math.max(0, Math.min(5, displayRank));
    return safeRank * laneHeight;
  };

  /**
   * アニメーション自動開始（3秒後）
   */
  useEffect(() => {
    if (!animationCompleted && !isGlobalAnimating) {
      const timer = setTimeout(() => {
        setIsGlobalAnimating(true);
        startAnimation();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [startAnimation, animationCompleted, isGlobalAnimating]);

  /**
   * キーボードナビゲーション
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        if (window.confirm("前の画面へ戻りますか?")) {
          router.back();
        }
      } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
        navigateToNextStep(gameId, currentQuizIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameId, currentQuizIdx, router]);

  // 現在の表示順位でソート
  const sortedUsers = animatedUsers.toSorted((a, b) => a.currentDisplayRank - b.currentDisplayRank);

  // 上位6位と7位以降に分割
  const otherUsers = sortedUsers.filter(user => user.currentDisplayRank >= 6);

  return (
    <main className={styles.bg}>
      {/* 🌟 全体スピードラインエフェクト */}
      <SpeedLines isActive={isGlobalAnimating} />

      {/* 🏟️ ヘッダー（ステージ背景） */}
      <div className={styles.header}>
        <Image
          src="/images/stage.png"
          alt="ステージの背景"
          width={3840}
          height={880}
          priority
        />
      </div>

      {/* 🏁 メインランキングエリア（上位6位） */}
      <div className={styles.rankingArea}>
        <div className={styles.laneBorderTop}></div>
        <div className={styles.lanesContainer}>
          {/* 🛣️ レーン背景（6レーン） */}
          {Array.from({ length: 6 }, (_, laneIndex) => (
            <div key={`lane-bg-${laneIndex}`} className={`${styles.laneBackground} ${laneIndex === 5 ? styles.lastLane : ''}`}>
              <div className={styles.laneNumber}>
                <Image
                  src={`/images/lane/lane_${laneIndex + 1}.png`}
                  alt={`Lane ${laneIndex + 1}`}
                  width={100}
                  height={150}
                  className={styles.laneNumberImage}
                />
              </div>
            </div>
          ))}

          {/* 🛞 タイヤ痕レイヤー */}
          <div className={styles.tireTrailLayer}>
            {tireTrails.map((trail, index) => (
              <TireTrail
                key={`${trail.userId}-${index}`}
                isActive={true}
                startX={trail.startX}
                endX={trail.endX}
                laneIndex={trail.laneIndex}
              />
            ))}
          </div>

          <div className={styles.cartsLayer}>
            <AnimatePresence>
              {/* 上位6位または降格アニメーション中のユーザーを表示 */}
              {animatedUsers
                .filter(user =>
                  // 上位6位または降格アニメーション中
                  user.currentDisplayRank < 6 || (user.isDemotionToBottom && user.isAnimating)
                )
                .map(user => {
                const xPosition = getXPosition(user.animatedScore);

                /**
                 * アニメーション設定を取得
                 * 昇格・降格・通常の3パターン
                 */
                const getAnimationSettings = () => {
                  // 🚀 昇格アニメーション（下から上へ）
                  if (user.isPromotionFromBottom && user.isAnimating) {
                    return {
                      initial: {
                        y: "60vh", // 下部エリアから開始
                        opacity: 0.8,
                        scale: 0.8
                      },
                      animate: {
                        y: 0, // 通常位置へ
                        opacity: 1,
                        scale: 1.05
                      },
                      transition: {
                        y: { duration: 1.8, ease: "easeOut" },
                        opacity: { duration: 0.6, ease: "easeOut" },
                        scale: { duration: 0.3, ease: "easeOut" }
                      }
                    };
                  }
                  // 📉 降格アニメーション（上から下へ）
                  if (user.isDemotionToBottom && user.isAnimating) {
                    return {
                      initial: {},
                      animate: {
                        y: "60vh", // 下部エリアへ落下
                        opacity: 0.6,
                        scale: 0.9
                      },
                      transition: {
                        y: { duration: 1.8, ease: "easeIn" },
                        opacity: { duration: 1.2, ease: "easeIn" },
                        scale: { duration: 0.8, ease: "easeIn" }
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
                      scale: { duration: user.isAnimating ? 0.3 : 0, ease: "easeOut" },
                      y: { duration: user.isAnimating ? 0.6 : 0, ease: "easeOut" }
                    }
                  };
                };

                const animationSettings = getAnimationSettings();

                return (
                  <motion.div
                    key={user.userId}
                    className={`${styles.animatedCart} ${user.isPromotionFromBottom ? styles.promotionCart : ''} ${user.isDemotionToBottom ? styles.demotionCart : ''}`}
                    initial={animationSettings.initial}
                    animate={{
                      marginLeft: `${xPosition}%`,
                      top: `${getLaneYPosition(user.currentDisplayRank) - 4}%`,
                      ...animationSettings.animate
                    }}
                    transition={{
                      marginLeft: { duration: user.isAnimating ? 1.5 : 0, ease: "easeOut" },
                      top: { duration: user.isAnimating ? 1.2 : 0, ease: "easeOut" },
                      ...animationSettings.transition
                    }}
                  >
                    {/* 💨 パーティクルエフェクト（通常 or 降格用） */}
                    {!user.isDemotionToBottom ? (
                      <ExhaustParticles
                        isActive={user.isAnimating}
                        color={user.characterColor}
                      />
                    ) : (
                      <DarkSmokeParticles isActive={user.isAnimating} />
                    )}

                    {/* 🌟 昇格エフェクト */}
                    {user.isPromotionFromBottom && user.isAnimating && (
                      <div className={styles.promotionEffect}>
                        <div className={styles.promotionGlow}></div>
                        <div className={styles.promotionTrail}></div>
                      </div>
                    )}

                    {/* 🌑 降格エフェクト */}
                    {user.isDemotionToBottom && user.isAnimating && (
                      <div className={styles.demotionEffect}>
                        <div className={styles.demotionShadow}></div>
                        <div className={styles.demotionTrail}></div>
                      </div>
                    )}

                    {/* 🏎️ カート画像とスコア吹き出し */}
                    <div className={styles.cartWithScore}>
                      <Image
                        src={user.characterImage}
                        alt={`${user.currentDisplayRank + 1}位`}
                        width={180}
                        height={100}
                        className={`${styles.cartImage} ${user.isAnimating ? styles.cartMoving : ''} ${user.isPromotionFromBottom ? styles.cartPromotion : ''} ${user.isDemotionToBottom ? styles.cartDemotion : ''}`}
                      />
                      <motion.div
                        className={`${styles.scoreBubble} ${user.isAnimating ? styles.animatingScore : ''} ${user.isPromotionFromBottom ? styles.promotionScore : ''} ${user.isDemotionToBottom ? styles.demotionScore : ''}`}
                        style={{
                          backgroundColor: `rgba(${parseInt(user.characterColor.slice(1, 3), 16)}, ${parseInt(user.characterColor.slice(3, 5), 16)}, ${parseInt(user.characterColor.slice(5, 7), 16)}, 0.8)`
                        }}
                        animate={{
                          scale: user.isAnimating ? 1.1 : 1
                        }}
                        transition={{ duration: user.isAnimating ? 0.3 : 0, ease: "easeOut" }}
                      >
                        {user.animatedScore}
                        <span>pt</span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
        <div className={styles.laneBorderBottom}></div>
      </div>

      {/* 📋 下部ランキングエリア（7位以降） */}
      <div className={styles.bottomRankingArea}>
        <AnimatePresence>
          {otherUsers.map((user) => {
            const displayRankNumber = user.currentDisplayRank + 1; // 1ベースの順位表示

            return (
              <motion.div
                key={user.userId}
                className={styles.bottomRankItem}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.3 }
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
                  <Image
                    src={user.characterImage}
                    alt={`${displayRankNumber}位`}
                    width={130}
                    height={139}
                    className={`${styles.bottomCartImage} ${user.isAnimating ? styles.cartMoving : ''}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default CurrentRankingScreen;