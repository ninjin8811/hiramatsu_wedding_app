"use client";

import { listenGameAnswers } from "@/app/_repositories/answer_repository";
import { listenItems } from "@/app/_repositories/item_repository";
import styles from "./CurrentRanking.module.scss";
import { listenGame } from "@/app/_repositories/game_repository";
import { Answer, Game } from "@/app/_types";
import { useCallback, useEffect, useState } from "react";
import StorageImage from "@/app/(routes)/game/[gameId]/user/_components/StorageImage/StorageImage";
import Image from "next/image";
import { UserAppItem } from "../../../user/_utils/userappTypes";
import { fetchGame } from "@/app/_repositories/game_repository";
import { updateDoc } from "firebase/firestore";
import { documentGet } from "@/app/_lib/firebase/ClientConverter";
import { GameSchema } from "@/app/_types";

type Props = {
  gameId: string;
};

type ItemStatus = "notUsed" | "using" | "used";

// 表示するアイテムの順序
const DISPLAY_ITEMS = [
  "kinoko",
  "green",
  "blue",
  "bomb",
  "killer",
  "special_kinoko",
];

// アイテムの背景色設定
const ITEM_BACKGROUND_COLORS: Record<string, string> = {
  green: "green",
  blue: "blue",
  kinoko: "default",
  bomb: "default",
  killer: "default",
};

export default function CurrentRanking(props: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [items, setItems] = useState<UserAppItem[]>([]);
  const currentQuestionIndex = game?.currentProcess.index;
  const currentQuestionCorrectAnswer =
    currentQuestionIndex !== null &&
    currentQuestionIndex !== undefined &&
    game?.questions &&
    game.questions.length > currentQuestionIndex
      ? game.questions[currentQuestionIndex].correctIndex
      : null;
  const ranking = game?.users.sort((a, b) => b.score - a.score);

  useEffect(() => {
    const gameUnsub = listenGame(props.gameId, (game) => setGame(game));
    const answersUnsub = listenGameAnswers(props.gameId, (answers) =>
      setAnswers(answers)
    );
    const itemsUnsub = listenItems((items) => setItems(items));

    return () => {
      gameUnsub();
      answersUnsub();
      itemsUnsub();
    };
  }, [props.gameId]);

  const getItem = useCallback(
    (itemId: string) => {
      return items.find((item) => item.itemId === itemId);
    },
    [items]
  );

  const checkItemStatus = (userId: string, itemId: string): ItemStatus => {
    if (currentQuestionIndex === null) {
      return "notUsed";
    }

    const userAnswers = answers.filter((answer) => answer.userId === userId);

    const useItemAnswer = userAnswers.find(
      (answer) => answer.usedItemId === itemId
    );

    if (!useItemAnswer) return "notUsed";
    if (useItemAnswer.questionIndex === currentQuestionIndex) {
      return "using";
    }
    return "used";
  };

  const getCurrentUserAnswer = (userId: string) => {
    return answers.find(
      (answer) =>
        answer.userId === userId &&
        answer.questionIndex === currentQuestionIndex
    );
  };

  // 過去の問題の解答状況を取得
  const getUserAnswerHistory = (userId: string) => {
    if (!game?.questions) return [];

    return game.questions.map((question, index) => {
      const answer = answers.find(
        (a) => a.userId === userId && a.questionIndex === index
      );

      if (!answer)
        return { questionIndex: index, answered: false, correct: false };

      return {
        questionIndex: index,
        answered: true,
        correct: answer.optionIndex === question.correctIndex,
      };
    });
  };

  // 現在の問題の解答状況サマリーを取得
  const getCurrentQuestionSummary = () => {
    if (
      !game?.users ||
      currentQuestionIndex === null ||
      currentQuestionIndex === undefined
    ) {
      return { answered: 0, total: 0, correct: 0 };
    }

    const totalUsers = game.users.length;
    const currentAnswers = answers.filter(
      (answer) => answer.questionIndex === currentQuestionIndex
    );
    const answeredUsers = currentAnswers.length;
    const correctAnswers = currentAnswers.filter(
      (answer) => answer.optionIndex === currentQuestionCorrectAnswer
    ).length;

    return {
      answered: answeredUsers,
      total: totalUsers,
      correct: correctAnswers,
    };
  };

  // アイテム不足の警告を取得
  const getItemShortageWarning = () => {
    if (
      !game?.questions ||
      currentQuestionIndex === null ||
      currentQuestionIndex === undefined
    ) {
      return null;
    }

    const remainingQuestions =
      game.questions.length - (currentQuestionIndex + 1);
    const usersWithInsufficientItems = game.users.filter((user) => {
      return user.itemIds.length < remainingQuestions;
    });

    if (usersWithInsufficientItems.length === 0) {
      return null;
    }

    return {
      users: usersWithInsufficientItems,
      remainingQuestions,
      message: `${usersWithInsufficientItems.length}人のアイテムが不足しています（残り${remainingQuestions}問）`,
    };
  };

  const giveItemToUser = async (userId: string, itemId: string) => {
    if (!game) return;

    const users = game.users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          itemIds: [...user.itemIds, itemId],
        };
      }
      return user;
    });

    const gameRef = documentGet(GameSchema, "Games", props.gameId);
    await updateDoc(gameRef, {
      users,
    });
  };

  const handleItemClick = (
    userId: string,
    itemId: string,
    itemName: string,
    userName: string
  ) => {
    const confirmed = window.confirm(
      `${userName}に${itemName}を付与しますか？`
    );
    if (confirmed) {
      giveItemToUser(userId, itemId);
    }
  };

  const getItemBackgroundClass = (itemId: string) => {
    const color = ITEM_BACKGROUND_COLORS[itemId];
    return color ? styles[`itemBg_${color}`] : "";
  };

  const getAnswerStateDisplay = (userId: string) => {
    const userAnswer = getCurrentUserAnswer(userId);

    // デバッグ情報をコンソールに出力
    console.log(`User ${userId}:`, {
      userAnswer,
      currentQuestionIndex,
      currentQuestionCorrectAnswer,
      userAnswerOptionIndex: userAnswer?.optionIndex,
      isCorrect: userAnswer?.optionIndex === currentQuestionCorrectAnswer,
      gameStatus: game?.status,
      currentProcess: game?.currentProcess,
      questionsLength: game?.questions?.length,
      currentQuestion: game?.questions?.[currentQuestionIndex || 0],
      allQuestions: game?.questions,
    });

    // ゲームが進行中でない、または現在の質問がない場合は回答状態を表示しない
    if (
      game?.status !== "inProgress" ||
      currentQuestionIndex === null ||
      currentQuestionIndex === undefined ||
      game?.currentProcess.type !== "question"
    ) {
      return "-";
    }

    if (!userAnswer) {
      return "-";
    }

    if (userAnswer.optionIndex === currentQuestionCorrectAnswer) {
      return "✅";
    } else {
      return "❌";
    }
  };

  // 表示するアイテムのみをフィルタリング
  const displayItems = items
    .filter((item) => DISPLAY_ITEMS.includes(item.itemId))
    .sort((a, b) => {
      return DISPLAY_ITEMS.indexOf(a.itemId) - DISPLAY_ITEMS.indexOf(b.itemId);
    });

  const currentQuestionSummary = getCurrentQuestionSummary();
  const itemShortageWarning = getItemShortageWarning();

  return (
    <div className={styles.container}>
      {/* アイテム不足警告 */}
      {itemShortageWarning && (
        <div className={styles.itemShortageWarning}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningContent}>
            <div className={styles.warningMessage}>
              {itemShortageWarning.message}
            </div>
            <div className={styles.warningUsers}>
              {itemShortageWarning.users
                .map((user) => (
                  <span key={user.id} className={styles.warningUser}>
                    {user.name}（アイテム{user.itemIds.length}個）
                  </span>
                ))
                .join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* 現在の問題の解答状況サマリー */}
      {game?.status === "inProgress" &&
        currentQuestionIndex !== null &&
        currentQuestionIndex !== undefined && (
          <div className={styles.currentQuestionSummary}>
            <h3>現在の問題 ({currentQuestionIndex + 1}問目)</h3>
            <div className={styles.summaryStats}>
              <span>
                回答済み: {currentQuestionSummary.answered}/
                {currentQuestionSummary.total}人
              </span>
              <span>正解: {currentQuestionSummary.correct}人</span>
              <span>
                正答率:{" "}
                {currentQuestionSummary.total > 0
                  ? Math.round(
                      (currentQuestionSummary.correct /
                        currentQuestionSummary.total) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        )}

      <div className={styles.ranking_list}>
        {ranking?.map((user, index) => {
          const answerHistory = getUserAnswerHistory(user.id);

          return (
            <div className={styles.rankingItem} key={user.id}>
              <div className={styles.rank}>{index + 1}</div>
              <div className={styles.userInfo}>
                <div className={styles.thumbnail}>
                  <StorageImage
                    path={user.thumbnail}
                    alt={user.name}
                    width={40}
                    height={40}
                    className={styles.userThumbnail}
                    fit="cover"
                  />
                </div>
                <div className={styles.name}>{user.name}</div>
              </div>
              <div className={styles.score}>{user.score}</div>
              <div className={styles.userItems}>
                {user.itemIds.map((itemId, index) => {
                  const item = getItem(itemId);
                  const status = checkItemStatus(user.id, itemId);

                  return (
                    <div
                      className={`${styles.item} ${
                        styles[`status_${status}`]
                      } ${getItemBackgroundClass(itemId)}`}
                      key={index}
                    >
                      {item?.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={25}
                          height={25}
                          className={styles.itemThumbnail}
                        />
                      ) : (
                        <div className={styles.itemPlaceholder} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={styles.answerState}>
                {getAnswerStateDisplay(user.id)}
              </div>

              {/* 過去の問題の解答状況 */}
              <div className={styles.answerHistory}>
                {answerHistory.map((history, qIndex) => (
                  <div
                    key={qIndex}
                    className={`${styles.historyItem} ${
                      history.answered
                        ? history.correct
                          ? styles.correct
                          : styles.incorrect
                        : styles.notAnswered
                    }`}
                    title={`問題${qIndex + 1}: ${
                      history.answered
                        ? history.correct
                          ? "正解"
                          : "不正解"
                        : "未回答"
                    }`}
                  >
                    {history.answered ? (history.correct ? "○" : "×") : "-"}
                  </div>
                ))}
              </div>

              <div className={styles.itemSelection}>
                {displayItems.map((item) => (
                  <div
                    key={item.itemId}
                    className={`${
                      styles.selectableItem
                    } ${getItemBackgroundClass(item.itemId)}`}
                    onClick={() =>
                      handleItemClick(
                        user.id,
                        item.itemId,
                        item.name,
                        user.name
                      )
                    }
                    title={`${user.name}に${item.name}を付与`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={25}
                      height={25}
                      className={styles.selectableItemImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
