"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./QuizScreen.module.css";
import { CurrentProcess, Question, GameUser, Answer } from "@/app/_types";
import { QuizScreenTimer } from "./QuizScreenTimer";
import { useRouter } from "next/navigation";
import { navigateToAnimation, showAnswerAction } from "../actions";

const OPTION_LABELS = ["A", "B", "C", "D"];

interface QuizScreenProps {
  gameId: string;
  quizIdx: number;
  mode: Omit<CurrentProcess["type"], "animation">;
  totalQuestionLength: number;
  currentQuestionIdx: number;
  currentQuestion: Question;
  timeLimit: number;
  gameUsers: GameUser[];
  answers: Answer[];
}

const QuizScreen: React.FC<QuizScreenProps> = ({
  gameId,
  quizIdx,
  mode,
  totalQuestionLength,
  currentQuestionIdx,
  currentQuestion,
  timeLimit,
  gameUsers,
  answers,
}) => {
  const [canShowAnswer, setCanShowAnswer] = useState(false);
  const router = useRouter();
  const isModeAnswer = mode === "answer";

  // 各選択肢を選択したユーザーを取得する関数
  const getUsersForOption = useCallback(
    (optionIndex: number) => {
      const optionAnswers = answers.filter(
        (answer) =>
          answer.questionIndex === currentQuestionIdx &&
          answer.optionIndex === optionIndex
      );
      return optionAnswers
        .map((answer) => {
          return gameUsers.find((user) => user.id === answer.userId);
        })
        .filter((user) => user !== undefined);
    },
    [answers, currentQuestionIdx, gameUsers]
  );

  const showAnswer = useCallback(() => {
    if (!canShowAnswer && !window.confirm("答えを表示しますか?")) {
      return;
    }
    showAnswerAction(gameId, quizIdx);
  }, [canShowAnswer, gameId, quizIdx]);

  const handleTimeUp = useCallback(() => {
    setCanShowAnswer(true);
  }, [setCanShowAnswer]);

  // キーボード操作 (左右矢印で画面遷移)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (window.confirm("前の画面へ戻りますか?")) {
          router.back();
        }
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        // 答えを表示したら次の画面へ遷移
        if (isModeAnswer) return navigateToAnimation(gameId, quizIdx);
        showAnswer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAnswer, isModeAnswer, gameId, quizIdx, router]);

  return (
    <main className={styles.bg}>
      <div className={styles.quizContainer}>
        <div className={styles.header}>
          <span className={styles.progressText}>{`${currentQuestionIdx}/${
            totalQuestionLength - 1
          }`}</span>
          <div className={styles.questionTextContainer}>
            <h1 className={styles.questionText}>{currentQuestion.question}</h1>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.imageAndTimerContainer}>
            <div className={styles.imageContainer}>
              {currentQuestion.imagePath && (
                <Image
                  src={
                    isModeAnswer
                      ? currentQuestion.answerImagePath ||
                        currentQuestion.imagePath
                      : currentQuestion.imagePath
                  }
                  alt="Quiz image"
                  width={600}
                  height={338}
                  className={styles.quizImage}
                  priority
                />
              )}
            </div>
            <QuizScreenTimer timeLimit={timeLimit} onTimeUp={handleTimeUp} />
          </div>

          <div className={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              let optionClassName = styles.optionButton;
              if (isModeAnswer) {
                if (index === currentQuestion.correctIndex) {
                  optionClassName = `${styles.optionButton} ${styles.correct}`;
                } else {
                  optionClassName = `${styles.optionButton} ${styles.incorrect}`;
                }
              }

              const usersForOption = getUsersForOption(index);

              return (
                <div key={index} className={optionClassName}>
                  <span className={styles.optionLabel}>
                    {OPTION_LABELS[index]}
                  </span>
                  <div className={styles.optionContent}>
                    <span className={styles.optionText}>{option}</span>
                    {isModeAnswer && usersForOption.length > 0 && (
                      <div className={styles.userThumbnails}>
                        {usersForOption.map((user) => (
                          <div
                            key={user.id}
                            className={styles.userThumbnailWrapper}
                          >
                            <Image
                              src={user.thumbnail}
                              alt={user.name}
                              width={40}
                              height={40}
                              className={styles.userThumbnail}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuizScreen;
