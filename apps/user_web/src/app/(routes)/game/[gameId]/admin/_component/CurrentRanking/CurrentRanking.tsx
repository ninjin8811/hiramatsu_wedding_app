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

type ItemStatus = "notUsed" | "using" | "used" | "failed";

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
    const gameUnsub = listenGame(props.gameId, (game) => {
      console.log(`🎮 Game updated:`, game);
      setGame(game);
    });
    const answersUnsub = listenGameAnswers(props.gameId, (answers) => {
      console.log(`📝 Answers updated:`, answers);
      setAnswers(answers);
    });
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
    // 詳細なデバッグ情報を追加
    console.log(`🔍 DEBUG checkItemStatus: userId=${userId}, itemId=${itemId}`);
    console.log(`🔍 Current question index: ${currentQuestionIndex}`);

    if (currentQuestionIndex === null) {
      console.log(`🔍 No current question, returning notUsed`);
      return "notUsed";
    }

    const userAnswers = answers.filter((answer) => answer.userId === userId);
    console.log(`🔍 User answers:`, userAnswers);

    const useItemAnswer = userAnswers.find(
      (answer) => answer.usedItemId === itemId
    );
    console.log(`🔍 Use item answer:`, useItemAnswer);

    if (!useItemAnswer) {
      console.log(`🔍 No item usage found, returning notUsed`);
      return "notUsed";
    }

    // キノコ系アイテム（kinoko、special_kinoko）を使用した場合の特別な処理
    if (itemId === "kinoko" || itemId === "special_kinoko") {
      console.log(`🍄 Processing kinoko logic for ${itemId}...`);

      // キノコを使用した問題での回答を確認
      const kinokoQuestionAnswer = userAnswers.find(
        (answer) => answer.questionIndex === useItemAnswer.questionIndex
      );
      console.log(`🍄 Kinoko question answer:`, kinokoQuestionAnswer);

      // 正解の番号を取得
      const correctAnswer =
        game?.questions?.[useItemAnswer.questionIndex]?.correctIndex;
      console.log(
        `🍄 Correct answer for question ${useItemAnswer.questionIndex}:`,
        correctAnswer
      );

      // キノコを使用したが問題を間違えた場合
      if (
        kinokoQuestionAnswer &&
        correctAnswer !== null &&
        correctAnswer !== undefined &&
        kinokoQuestionAnswer.optionIndex !== correctAnswer
      ) {
        console.log(
          `🍄 FAILED: User ${userId}, itemId ${itemId}, question ${useItemAnswer.questionIndex}, userAnswer: ${kinokoQuestionAnswer.optionIndex}, correctAnswer: ${correctAnswer}`
        );
        return "failed";
      } else {
        console.log(`🍄 Kinoko usage was successful or no answer found`);
      }
    }

    if (useItemAnswer.questionIndex === currentQuestionIndex) {
      console.log(`🔍 Item is currently being used`);
      return "using";
    }

    console.log(`🔍 Item was used in past question`);
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

  return (
    <div className={styles.container}>
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

                  console.log(
                    `👤 User ${user.name} (${user.id}), Item ${itemId}, Status: ${status}`
                  );

                  // デバッグ情報
                  if (status === "failed") {
                    console.log(
                      `🔴 RENDERING FAILED ITEM: User ${user.name}, itemId ${itemId}, status ${status}`
                    );
                  }

                  const itemClasses = `${styles.item} ${
                    styles[`status_${status}`]
                  } ${getItemBackgroundClass(itemId)}`;

                  console.log(`🎨 CSS Classes for ${itemId}:`, itemClasses);

                  return (
                    <div
                      className={itemClasses}
                      key={index}
                      title={`${item?.name || itemId} - Status: ${status}`}
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
