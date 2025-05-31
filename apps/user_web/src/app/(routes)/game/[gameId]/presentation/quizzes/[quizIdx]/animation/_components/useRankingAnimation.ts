import { useState, useCallback } from 'react';
import { User, AnimatedUser, AnimationMode, TireTrail } from './types';
import { getAnimationDelay, getXPosition } from './animationUtils';

interface UseRankingAnimationProps {
  users: User[];
  animationMode: AnimationMode;
}

export const useRankingAnimation = ({ users, animationMode }: UseRankingAnimationProps) => {
  /** 全体のアニメーションが実行中かどうか */
  const [isGlobalAnimating, setIsGlobalAnimating] = useState(false);

  /** タイヤ痕の表示データ */
  const [tireTrails, setTireTrails] = useState<TireTrail[]>([]);

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
        isDemotionToBottom: false,         // 降格フラグ初期化
        isRankDown: false,                 // 順位下降フラグ初期化
        isRankUp: false                    // 順位上昇フラグ初期化
      };
    });
  };

  /** アニメーションするユーザーデータ */
  const [animatedUsers, setAnimatedUsers] = useState<AnimatedUser[]>(createInitialData);

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

    setAnimationCompleted(true);

    // 最終順位を計算
    const finalRanking = users.toSorted((a, b) => b.currentScore - a.currentScore);

    // 上位6位のチームのうち、スコアが変化したチームのみ抽出
    const top6ChangedUsers = finalRanking
      .slice(0, 6) // 上位6位のみ
      .filter(user => user.prevScore !== user.currentScore); // スコア変化したもののみ

    // 各チームのアニメーション情報を準備
    const animationData = top6ChangedUsers.map((userToAnimate, index) => {
      // タイヤ痕の軌跡を記録
      const startX = getXPosition(userToAnimate.prevScore);
      const endX = getXPosition(userToAnimate.currentScore);

      // 前回スコア順の順位と今回スコア順の順位を取得
      const prevRanking = users.toSorted((a, b) => b.prevScore - a.prevScore);
      const currentRanking = users.toSorted((a, b) => b.currentScore - a.currentScore);

      const prevRank = prevRanking.findIndex(u => u.userId === userToAnimate.userId);
      const newRank = currentRanking.findIndex(u => u.userId === userToAnimate.userId);

      // 特殊アニメーションの判定
      const isPromotionFromBottom = prevRank >= 6 && newRank < 6;  // 7位以降→6位以内
      const isDemotionToBottom = prevRank < 6 && newRank >= 6;     // 6位以内→7位以降
      const isRankUp = prevRank < 6 && newRank < 6 && newRank < prevRank;  // 上位6位内での順位上昇
      const isRankDown = prevRank < 6 && newRank < 6 && newRank > prevRank; // 上位6位内での順位下降

      console.log(`📊 ${userToAnimate.teamName}: ${prevRank}→${newRank} (${userToAnimate.prevScore}→${userToAnimate.currentScore}pt) | ⬆️${isPromotionFromBottom} ⬇️${isDemotionToBottom} 🔺${isRankUp} 🔻${isRankDown}`);

      return {
        userToAnimate,
        newRank,
        prevRank,
        startX,
        endX,
        isPromotionFromBottom,
        isDemotionToBottom,
        isRankUp,
        isRankDown,
        delay: getAnimationDelay(animationMode, index) // モードに応じた遅延時間
      };
    });

    // 全てのアニメーションを段階的に同時開始
    const animationPromises = animationData.map(async (data, index) => {
      const {
        userToAnimate,
        newRank,
        prevRank,
        startX,
        endX,
        isPromotionFromBottom,
        isDemotionToBottom,
        isRankUp,
        isRankDown,
        delay
      } = data;

      // 段階的開始のための遅延
      await new Promise(resolve => setTimeout(resolve, delay));

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
                isDemotionToBottom,
                isRankUp,
                isRankDown
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
        const duration = 3000; // 倍に延長
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
                    isDemotionToBottom: false,    // フラグをリセット
                    isRankUp: false,             // フラグをリセット
                    isRankDown: false            // フラグをリセット
                  }
                : user
            ));
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });

      // タイヤ痕をフェードアウト後削除
      setTimeout(() => {
        setTireTrails(prev => prev.filter(trail => trail.userId !== userToAnimate.userId));
      }, 4000); // 倍に延長
    });

    // 全てのアニメーションが完了するまで待機
    await Promise.all(animationPromises);

    // 全アニメーション完了
    setIsGlobalAnimating(false);
  }, [users, updateUserRanks, animationCompleted, animationMode]);

  return {
    isGlobalAnimating,
    setIsGlobalAnimating,
    tireTrails,
    animationCompleted,
    animatedUsers,
    startAnimation
  };
};