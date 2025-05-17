'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './QuizScreen.module.css';
import { Question } from '@/app/_types';
import { QuizScreenTimer } from './QuizScreenTimer';
import { useRouter } from 'next/navigation';


const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuizScreenProps {
  totalQuestionLength: number;
  currentQuestionIdx: number;
  currentQuestion: Question;
  timeLimit: number;
  nextPath: string;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ totalQuestionLength, currentQuestionIdx, currentQuestion, timeLimit, nextPath }) => {
  const [isShowAnswer, _setIsShowAnswer] = useState(false);
  const [canShowAnswer, setCanShowAnswer] = useState(false);
  const router = useRouter();

  const showAnswer = useCallback(() => {
    if (canShowAnswer) {
      _setIsShowAnswer(true);
    } else if (window.confirm("答えを表示しますか?")) {
      _setIsShowAnswer(true);
    }
  }, [canShowAnswer]);

  const handleTimeUp = useCallback(() => {
    setCanShowAnswer(true);
  }, [setCanShowAnswer]);

  // キーボード操作 (左右矢印で画面遷移)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        if (window.confirm("前の画面へ戻りますか?")) {
          router.back();
        }
      } else if (event.key === 'ArrowRight') {
        if (isShowAnswer) return router.push(nextPath);
        showAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAnswer, isShowAnswer, nextPath, router]);

  return (
    <main className={styles.bg}>
      <div className={styles.quizContainer}>
        <div className={styles.header}>
          <span className={styles.progressText}>{`${currentQuestionIdx + 1}/${totalQuestionLength}`}</span>
          <div className={styles.questionTextContainer}>
            <h1 className={styles.questionText}>{currentQuestion.question}</h1>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.imageAndTimerContainer}>
            <div className={styles.imageContainer}>
              {currentQuestion.imagePath && (
                <Image
                  src={currentQuestion.imagePath}
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
              if (isShowAnswer) {
                if (index === currentQuestion.correctIndex) {
                  optionClassName = `${styles.optionButton} ${styles.correct}`;
                } else {
                  optionClassName = `${styles.optionButton} ${styles.incorrect}`;
                }
              }

              return (
                <div
                  key={index}
                  className={optionClassName}
                >
                  <span className={styles.optionLabel}>{OPTION_LABELS[index]}</span>
                  <span className={styles.optionText}>{option}</span>
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