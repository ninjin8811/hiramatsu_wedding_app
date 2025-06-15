import { useState, useCallback } from "react";
import { User, AnimatedUser, TireTrail, ItemEvent } from "./types";
import { ItemEffect } from "@/app/_types";
import { getXPosition } from "./animationUtils";

interface UseRankingAnimationProps {
  users: User[];
  itemEvents: ItemEvent[];
}

// アイテムイベントをグループ化するためのタイプ
interface GroupedItemEvent {
  itemName: string;
  itemMovie: string;
  userIds: string[];
  isCorrectAnswer: boolean;
  effect: ItemEffect;
  groupedEvents: ItemEvent[]; // 元のイベントを保持
}

export const useRankingAnimation = ({
  users,
  itemEvents,
}: UseRankingAnimationProps) => {
  /** 初手アニメーションの完了フラグ（重複実行防止） */
  const [animationCompleted, setAnimationCompleted] = useState(false);

  /** 全体のアニメーションが実行中かどうか */
  const [isGlobalAnimating, setIsGlobalAnimating] = useState(false);

  /** タイヤ痕の表示データ */
  const [tireTrails, setTireTrails] = useState<TireTrail[]>([]);

  // アイテムイベントをグループ化（kinokoアイテムのみをまとめる）
  const groupedItemEvents: GroupedItemEvent[] = (() => {
    const result: GroupedItemEvent[] = [];
    const kinokoEvents: ItemEvent[] = [];

    // kinokoアイテムとその他のアイテムを分ける
    itemEvents.forEach((event) => {
      if (event.itemId === "kinoko") {
        kinokoEvents.push(event);
      } else {
        // kinoko以外は個別のグループとして追加
        result.push({
          itemName: event.itemName,
          itemMovie: event.itemMovie,
          userIds: [event.userId],
          isCorrectAnswer: event.isCorrectAnswer,
          effect: event.effect,
          groupedEvents: [event],
        });
      }
    });

    // kinokoアイテムがある場合は、一つのグループとしてまとめる
    if (kinokoEvents.length > 0) {
      const firstKinokoEvent = kinokoEvents[0];
      result.push({
        itemName: "kinoko",
        itemMovie: firstKinokoEvent.itemMovie,
        userIds: kinokoEvents.map((e) => e.userId),
        isCorrectAnswer: firstKinokoEvent.isCorrectAnswer,
        effect: firstKinokoEvent.effect,
        groupedEvents: kinokoEvents,
      });
    }

    return result;
  })();

  /** 動画再生関連の状態 */
  const [moviePlaybackState, setMoviePlaybackState] = useState({
    isPlayingMovies: false,
    currentMovieIndex: 0,
    allMoviesCompleted: false,
  });

  const currentGroupedEvent: GroupedItemEvent | undefined =
    groupedItemEvents[moviePlaybackState.currentMovieIndex];

  /**
   * 初期表示用のアニメーションデータを作成
   * prevScoreを基準にした順位で初期配置
   */
  const createInitialData = (): AnimatedUser[] => {
    return users.map((user) => {
      return {
        ...user,
        animatedScore: user.prevScore, // 初期表示はprevScore
        isAnimating: false, // 初期状態はアニメーションなし
        isPromotionFromBottom: false, // 昇格フラグ初期化
        isDemotionToBottom: false, // 降格フラグ初期化
        isRankDown: false, // 順位下降フラグ初期化
        isRankUp: false, // 順位上昇フラグ初期化
      };
    });
  };

  /** アニメーションするユーザーデータ */
  const [animatedUsers, setAnimatedUsers] =
    useState<AnimatedUser[]>(createInitialData);

  /**
   * currentScoreベースで順位を計算する
   */
  const getRankByScore = useCallback(
    (
      users: { currentScore: number; userId: string }[],
      userId: string
    ): number => {
      const sortedUsers = users.toSorted(
        (a, b) => b.currentScore - a.currentScore
      );
      return sortedUsers.findIndex((u) => u.userId === userId);
    },
    []
  );

  /**
   * エフェクトを実行してユーザーのスコアを更新
   */
  const applyItemEffect = useCallback(
    (
      effect: ItemEffect,
      currentUsers: AnimatedUser[],
      isCorrectAnswer: boolean,
      targetUserId?: string
    ): AnimatedUser[] => {
      // 現在のランキングを計算（currentScoreベース）
      const currentRanking = currentUsers.toSorted(
        (a, b) => b.currentScore - a.currentScore
      );

      let targetUsers: AnimatedUser[] = [];
      const effectType = effect.effectType || "score_change";

      // 条件付きエフェクトのチェック
      if (
        effectType === "conditional_bonus" &&
        effect.condition === "correct_answer" &&
        !isCorrectAnswer
      ) {
        console.log("🚫 Conditional effect not triggered (not correct answer)");
        return currentUsers;
      }

      // ターゲットユーザーを特定
      if (effect.targetType) {
        switch (effect.targetType) {
          case "rank_position":
            const rankPosition = Number(effect.targetValue) - 1; // 1-basedから0-basedに変換
            if (rankPosition >= 0 && rankPosition < currentRanking.length) {
              targetUsers = [currentRanking[rankPosition]];
            }
            break;
          case "item_used_user":
            // targetUserIdが指定されている場合はそれを使用、そうでなければグループ化されたイベントの最初のユーザー
            const userId = targetUserId || currentGroupedEvent?.userIds[0];
            const targetUser = currentUsers.find((u) => u.userId === userId);
            if (targetUser) {
              targetUsers = [targetUser];
            }
            break;
          case "all_users":
            // topRanksOnlyが指定されている場合は上位N位のみ
            if (effect.topRanksOnly) {
              targetUsers = currentRanking.slice(0, effect.topRanksOnly);
            } else {
              targetUsers = [...currentUsers];
            }
            break;
          case "random_users":
            const count = Number(effect.targetValue) || 1;
            // topRanksOnlyが指定されている場合は上位N位からランダム選択
            const candidateUsers = effect.topRanksOnly
              ? currentRanking.slice(0, effect.topRanksOnly)
              : currentUsers;
            const shuffled = [...candidateUsers].sort(
              () => Math.random() - 0.5
            );
            targetUsers = shuffled.slice(
              0,
              Math.min(count, candidateUsers.length)
            );
            break;
        }
      }

      // エフェクトを適用
      return currentUsers.map((user) => {
        if (targetUsers.some((target) => target.userId === user.userId)) {
          let newScore = user.currentScore;

          switch (effectType) {
            case "score_change":
            case "conditional_bonus":
              newScore = Math.max(
                0,
                user.currentScore + (effect.scoreChange || 0)
              );
              break;
            case "copy_rank_score":
              if (effect.copyFromRank) {
                const copyFromIndex = effect.copyFromRank - 1; // 1-basedから0-basedに変換
                if (
                  copyFromIndex >= 0 &&
                  copyFromIndex < currentRanking.length
                ) {
                  newScore = currentRanking[copyFromIndex].currentScore;
                  console.log(
                    `📋 Copying score from rank ${effect.copyFromRank}: ${user.teamName} gets ${newScore}pt`
                  );
                }
              }
              break;
          }

          console.log(
            `🎯 Effect applied to ${user.teamName}: ${user.currentScore} → ${newScore} (${effectType})`
          );
          return { ...user, currentScore: newScore };
        }
        return user;
      });
    },
    [currentGroupedEvent?.userIds]
  );

  /**
   * エフェクト実行後のランキングアニメーションを開始
   */
  const startEffectAnimation = useCallback(
    async (updatedUsers: AnimatedUser[], onComplete: () => void) => {
      console.log("🎬 Starting effect animation...");

      setIsGlobalAnimating(true);

      // エフェクト適用前後でスコアが変化したユーザーを特定
      const changedUsers = updatedUsers.filter((user) => {
        const originalUser = animatedUsers.find(
          (u) => u.userId === user.userId
        );
        return originalUser && originalUser.currentScore !== user.currentScore;
      });

      // 順位が変化したユーザーを特定（スコア変化なしでも）
      const rankChangedUsers = updatedUsers.filter((user) => {
        const prevRank = getRankByScore(animatedUsers, user.userId);
        const newRank = getRankByScore(updatedUsers, user.userId);
        const hasScoreChange = changedUsers.some(
          (c) => c.userId === user.userId
        );

        return prevRank !== newRank && !hasScoreChange; // 順位変化したがスコア変化していない
      });

      // アニメーション対象：スコア変化 + 順位変化
      const allAnimationUsers = [...changedUsers, ...rankChangedUsers];

      if (allAnimationUsers.length === 0) {
        console.log("🚫 No score or rank changes detected, skipping animation");
        setIsGlobalAnimating(false);
        onComplete();
        return;
      }

      // 変化したユーザーのアニメーション情報を準備
      const animationData = allAnimationUsers
        .map((userToAnimate) => {
          const originalUser = animatedUsers.find(
            (u) => u.userId === userToAnimate.userId
          );
          if (!originalUser) return null;

          // スコア変化があるかどうかを判定
          const hasScoreChange = changedUsers.some(
            (c) => c.userId === userToAnimate.userId
          );

          // タイヤ痕の軌跡を記録（スコア変化がある場合のみ）
          const startX = getXPosition(originalUser.currentScore);
          const endX = getXPosition(userToAnimate.currentScore);

          // 元のランキングと新しいランキングでの順位を取得
          const prevRank = getRankByScore(animatedUsers, userToAnimate.userId);
          const newRank = getRankByScore(updatedUsers, userToAnimate.userId);

          // 特殊アニメーションの判定
          const isPromotionFromBottom = prevRank >= 6 && newRank < 6;
          const isDemotionToBottom = prevRank < 6 && newRank >= 6;
          const isRankUp = prevRank < 6 && newRank < 6 && newRank < prevRank;
          const isRankDown = prevRank < 6 && newRank < 6 && newRank > prevRank;

          const changeType = hasScoreChange ? "Score+Rank" : "Rank only";
          console.log(
            `📊 Effect ${userToAnimate.teamName}: ${prevRank}→${newRank} (${originalUser.currentScore}→${userToAnimate.currentScore}pt) [${changeType}] | ⬆️${isPromotionFromBottom} ⬇️${isDemotionToBottom} 🔺${isRankUp} 🔻${isRankDown}`
          );

          return {
            userToAnimate,
            originalUser,
            newRank,
            prevRank,
            startX,
            endX,
            isPromotionFromBottom,
            isDemotionToBottom,
            isRankUp,
            isRankDown,
            hasScoreChange,
            delay: Math.random() * 2000, // ランダムな遅延（0-2秒）
          };
        })
        .filter(Boolean);

      // 変化しなかったユーザーのanimatedScoreも同期
      setAnimatedUsers((prev) =>
        prev.map((user) => {
          const updatedUser = updatedUsers.find(
            (u) => u.userId === user.userId
          );
          if (
            updatedUser &&
            !allAnimationUsers.some((c) => c.userId === user.userId)
          ) {
            // スコア変化も順位変化もないが、currentScoreとanimatedScoreを同期
            return {
              ...user,
              animatedScore: updatedUser.currentScore,
              currentScore: updatedUser.currentScore,
            };
          }
          return user;
        })
      );

      // アニメーションプロミスを作成
      const animationPromises = animationData.map(async (data) => {
        if (!data) return;

        const {
          userToAnimate,
          originalUser,
          newRank,
          prevRank,
          startX,
          endX,
          isPromotionFromBottom,
          isDemotionToBottom,
          isRankUp,
          isRankDown,
          hasScoreChange,
          delay,
        } = data;

        // 段階的開始のための遅延
        await new Promise((resolve) => setTimeout(resolve, delay));

        // アニメーション開始：フラグ設定
        setAnimatedUsers((prev) => {
          return prev.map((user) =>
            user.userId === userToAnimate.userId
              ? {
                  ...user,
                  isAnimating: true,
                  isPromotionFromBottom,
                  isDemotionToBottom,
                  isRankUp,
                  isRankDown,
                  currentScore: userToAnimate.currentScore, // currentScoreも更新
                }
              : user
          );
        });

        // タイヤ痕エフェクトを追加
        const safePrevRank = Math.max(0, Math.min(5, prevRank));
        setTireTrails((prev) => [
          ...prev,
          {
            userId: userToAnimate.userId,
            startX,
            endX,
            laneIndex: safePrevRank,
          },
        ]);

        // スコアカウントアップアニメーション
        await new Promise<void>((resolve) => {
          const duration = 3000;
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const startScore = originalUser.currentScore;
            const endScore = userToAnimate.currentScore;
            const currentScore = Math.round(
              startScore + (endScore - startScore) * easeOut
            );

            // リアルタイムでスコアを更新
            setAnimatedUsers((prev) =>
              prev.map((user) =>
                user.userId === userToAnimate.userId
                  ? { ...user, animatedScore: currentScore }
                  : user
              )
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // アニメーション完了：最終状態に設定
              setAnimatedUsers((prev) =>
                prev.map((user) =>
                  user.userId === userToAnimate.userId
                    ? {
                        ...user,
                        animatedScore: userToAnimate.currentScore,
                        isAnimating: false,
                        isPromotionFromBottom: false,
                        isDemotionToBottom: false,
                        isRankUp: false,
                        isRankDown: false,
                      }
                    : user
                )
              );
              resolve();
            }
          };

          requestAnimationFrame(animate);
        });

        // タイヤ痕をフェードアウト後削除
        setTimeout(() => {
          setTireTrails((prev) =>
            prev.filter((trail) => trail.userId !== userToAnimate.userId)
          );
        }, 4000);
      });

      // 全てのアニメーションが完了するまで待機
      await Promise.all(animationPromises);

      setIsGlobalAnimating(false);

      // アニメーション完了後のコールバックを実行
      onComplete();
    },
    [animatedUsers, getRankByScore]
  );

  /**
   * 次の動画に進む
   */
  const proceedToNextMovie = useCallback(() => {
    setMoviePlaybackState((prev) => {
      const nextIndex = prev.currentMovieIndex + 1;

      if (nextIndex >= groupedItemEvents.length) {
        // 全ての動画再生完了
        return {
          ...prev,
          isPlayingMovies: false,
          allMoviesCompleted: true,
        };
      } else {
        // 次の動画に進む
        return {
          ...prev,
          currentMovieIndex: nextIndex,
        };
      }
    });
  }, [groupedItemEvents.length]);

  /**
   * 動画終了後にエフェクトを実行する
   */
  const playNextMovie = useCallback(() => {
    const currentEvent =
      groupedItemEvents[moviePlaybackState.currentMovieIndex];

    // 現在の動画のエフェクトを実行
    if (currentEvent) {
      console.log(
        `🎬 Applying effects for item: ${currentEvent.itemName} (users: ${currentEvent.userIds.length})`
      );

      // グループ化されたイベントの場合、各ユーザーに対してエフェクトを適用
      let updatedUsers = animatedUsers;
      currentEvent.groupedEvents.forEach((event) => {
        console.log(`🎯 Applying effect for user: ${event.userId}`);
        // 個別のイベントに対してエフェクト適用
        updatedUsers = applyItemEffect(
          event.effect,
          updatedUsers,
          event.isCorrectAnswer,
          event.userId
        );
      });

      // エフェクトアニメーションを開始（完了後に次の動画に進む）
      setTimeout(() => {
        startEffectAnimation(updatedUsers, proceedToNextMovie);
      }, 500); // 少し遅延してからアニメーション開始
    } else {
      // エフェクトがない場合は直接次の動画に進む
      proceedToNextMovie();
    }
  }, [
    groupedItemEvents,
    moviePlaybackState.currentMovieIndex,
    animatedUsers,
    applyItemEffect,
    startEffectAnimation,
    proceedToNextMovie,
  ]);

  /**
   * 動画再生を開始する
   */
  const startMoviePlayback = useCallback(() => {
    if (groupedItemEvents.length > 0) {
      setMoviePlaybackState({
        isPlayingMovies: true,
        currentMovieIndex: 0,
        allMoviesCompleted: false,
      });
    } else {
      // 動画がない場合は即座に完了扱い
      setMoviePlaybackState({
        isPlayingMovies: false,
        currentMovieIndex: 0,
        allMoviesCompleted: true,
      });
    }
  }, [groupedItemEvents.length]);

  /**
   * 段階的ランキングアニメーションの実行
   * 上位6位のスコア変化チームを順次アニメーション
   */
  const startAnimation = useCallback(async () => {
    // 重複実行防止
    if (animationCompleted) {
      console.log("🚫 Animation already completed, skipping...");
      return;
    }

    setAnimationCompleted(true);

    // スコア変化したユーザーを特定
    const changedUsers = users.filter(
      (user) => user.prevScore !== user.currentScore
    );

    // 順位が変化したユーザーを特定（スコア変化なしでも）
    const rankChangedUsers = users.filter((user) => {
      const prevRank = getRankByScore(
        users.map((u) => ({ ...u, currentScore: u.prevScore })),
        user.userId
      );
      const newRank = getRankByScore(
        users.map((u) => ({ ...u, currentScore: u.currentScore })),
        user.userId
      );
      const hasScoreChange = changedUsers.some((c) => c.userId === user.userId);

      return prevRank !== newRank && !hasScoreChange; // 順位変化したがスコア変化していない
    });

    // アニメーション対象：スコア変化 + 順位変化
    const allAnimationUsers = [...changedUsers, ...rankChangedUsers];

    // 変化しなかったユーザーのanimatedScoreも同期
    setAnimatedUsers((prev) =>
      prev.map((user) => {
        if (!allAnimationUsers.some((c) => c.userId === user.userId)) {
          // スコア変化も順位変化もないが、currentScoreとanimatedScoreを同期
          return {
            ...user,
            animatedScore: user.currentScore,
            currentScore: user.currentScore,
          };
        }
        return user;
      })
    );

    // 各チームのアニメーション情報を準備
    const animationData = allAnimationUsers.map((userToAnimate, index) => {
      // スコア変化があるかどうかを判定
      const hasScoreChange = changedUsers.some(
        (c) => c.userId === userToAnimate.userId
      );

      // タイヤ痕の軌跡を記録（スコア変化がある場合のみ）
      const startX = getXPosition(userToAnimate.prevScore);
      const endX = getXPosition(userToAnimate.currentScore);

      // 前回スコア順の順位と今回スコア順の順位を取得
      const prevRank = getRankByScore(
        users.map((u) => ({ ...u, currentScore: u.prevScore })),
        userToAnimate.userId
      );
      const newRank = getRankByScore(
        users.map((u) => ({ ...u, currentScore: u.currentScore })),
        userToAnimate.userId
      );

      // 特殊アニメーションの判定
      const isPromotionFromBottom = prevRank >= 6 && newRank < 6; // 7位以降→6位以内
      const isDemotionToBottom = prevRank < 6 && newRank >= 6; // 6位以内→7位以降
      const isRankUp = prevRank < 6 && newRank < 6 && newRank < prevRank; // 上位6位内での順位上昇
      const isRankDown = prevRank < 6 && newRank < 6 && newRank > prevRank; // 上位6位内での順位下降

      const changeType = hasScoreChange ? "Score+Rank" : "Rank only";
      console.log(
        `📊 Initial ${userToAnimate.teamName}: ${prevRank}→${newRank} (${userToAnimate.prevScore}→${userToAnimate.currentScore}pt) [${changeType}] | ⬆️${isPromotionFromBottom} ⬇️${isDemotionToBottom} 🔺${isRankUp} 🔻${isRankDown}`
      );

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
        hasScoreChange,
        delay: Math.random() * 2000, // ランダムな遅延（0-2秒）
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
        hasScoreChange,
        delay,
      } = data;

      // 段階的開始のための遅延
      await new Promise((resolve) => setTimeout(resolve, delay));

      // アニメーション開始：フラグ設定
      setAnimatedUsers((prev) => {
        return prev.map((user) =>
          user.userId === userToAnimate.userId
            ? {
                ...user,
                isAnimating: true,
                isPromotionFromBottom,
                isDemotionToBottom,
                isRankUp,
                isRankDown,
              }
            : user
        );
      });

      // タイヤ痕エフェクトを追加（スコア変化がある場合のみ）
      if (hasScoreChange) {
        const safePrevRank = Math.max(0, Math.min(5, prevRank));
        setTireTrails((prev) => [
          ...prev,
          {
            userId: userToAnimate.userId,
            startX,
            endX,
            laneIndex: safePrevRank,
          },
        ]);
      }

      // スコアカウントアップアニメーション
      await new Promise<void>((resolve) => {
        const duration = 3000;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3); // イージングアウト関数

          const startScore = userToAnimate.prevScore;
          const endScore = userToAnimate.currentScore;
          const currentScore = Math.round(
            startScore + (endScore - startScore) * easeOut
          );

          // リアルタイムでスコアを更新
          setAnimatedUsers((prev) =>
            prev.map((user) =>
              user.userId === userToAnimate.userId
                ? { ...user, animatedScore: currentScore }
                : user
            )
          );

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // アニメーション完了：最終状態に設定
            setAnimatedUsers((prev) =>
              prev.map((user) =>
                user.userId === userToAnimate.userId
                  ? {
                      ...user,
                      animatedScore: userToAnimate.currentScore,
                      isAnimating: false,
                      isPromotionFromBottom: false, // フラグをリセット
                      isDemotionToBottom: false, // フラグをリセット
                      isRankUp: false, // フラグをリセット
                      isRankDown: false, // フラグをリセット
                    }
                  : user
              )
            );
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });

      // タイヤ痕をフェードアウト後削除
      setTimeout(() => {
        setTireTrails((prev) =>
          prev.filter((trail) => trail.userId !== userToAnimate.userId)
        );
      }, 2000);
    });

    // 全てのアニメーションが完了するまで待機
    await Promise.all(animationPromises);

    // 全アニメーション完了
    // アニメーション完了後に動画再生を開始
    setTimeout(() => {
      setIsGlobalAnimating(false);
      startMoviePlayback();
    }, 3000);
  }, [users, animationCompleted, startMoviePlayback, getRankByScore]);

  return {
    isGlobalAnimating,
    setIsGlobalAnimating,
    tireTrails,
    animationCompleted,
    animatedUsers,
    startAnimation,
    moviePlaybackState,
    playNextMovie,
    currentGroupedEvent,
  };
};
