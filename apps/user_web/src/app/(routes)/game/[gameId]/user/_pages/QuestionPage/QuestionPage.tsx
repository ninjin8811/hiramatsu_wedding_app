"use client";
import Image from "next/image";
import styles from "./QuestionPage.module.scss";
import UserResultCorrectGif from "@/app/_images/UserResultCorrect.gif";
import UserResultIncorrectGif from "@/app/_images/UserResultIncorrect.gif";
import ItemDetailModal from "@user/_components/ItemDetailModal/ItemDetailModal";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Answer, AnswerSchema, Game } from "@/app/_types";
import { setDoc } from "firebase/firestore";
import { documentSet } from "@/app/_lib/firebase/ClientConverter";
import StorageImage from "../../_components/StorageImage/StorageImage";
// import IconTimer from "@/app/_images/IconTimer.png";
// import Indicator from "./QuestionIndicator";
import { useClientReplace } from "../../_utils/useClientReplace";
import { UserAppItem } from "../../_utils/userappTypes";
import { listenGame } from "@/app/_repositories/game_repository";
import { listenUserAnswers } from "@/app/_repositories/answer_repository";

type Props = {
  gameId: string;
  userId: string;
  game: Game;
  items: UserAppItem[];
};

export default function QuestionPage(props: Props) {
  const [game, setGame] = useState<Game>(props.game);
  useClientReplace(props.gameId, props.userId, "inProgress");

  const currentQuestionIndex = game.currentProcess.index;
  const currentQuestion = game.questions[currentQuestionIndex];
  const showAnswer = game.currentProcess.type !== "question";

  const user = game.users.find((user) => user.id === props.userId);
  const ownItems = user?.itemIds
    .map((itemId) => props.items.find((item) => item.itemId === itemId))
    .filter((item) => item !== undefined);
  const [ownAnswers, setOwnAnswers] = useState<Answer[]>([]);

  const currentOwnAnswer = ownAnswers.find(
    (answer) => answer.questionIndex === currentQuestionIndex
  );
  const selectedItemId = currentOwnAnswer?.usedItemId;
  const selectedAnswerIndex = currentOwnAnswer?.optionIndex;

  const correctRate = useCallback(() => {
    if (
      game.currentProcess.index === 0 &&
      game.currentProcess.type === "question"
    ) {
      return null;
    }
    const finishedLength =
      game.currentProcess.type !== "question"
        ? game.currentProcess.index + 1
        : game.currentProcess.index;
    return (
      ownAnswers.filter((answer, i) => {
        return (
          answer.optionIndex ===
            game.questions[answer.questionIndex].correctIndex &&
          answer.questionIndex <= finishedLength - 1
        );
      }).length / finishedLength
    );
  }, [
    game.currentProcess.index,
    game.currentProcess.type,
    game.questions,
    ownAnswers,
  ]);

  useEffect(() => {
    const unsub = listenGame(props.gameId, (game) => setGame(game as Game));
    return () => unsub();
  }, [props.gameId]);

  useEffect(() => {
    const unsub = listenUserAnswers(props.gameId, props.userId, (answers) => {
      setOwnAnswers(answers);
    });
    return () => unsub();
  }, [props.gameId, props.userId]);

  const submitAnswer = useCallback(
    async (index: number, itemId: string | null) => {
      const answer = {
        answerId: props.userId + "_" + currentQuestionIndex,
        questionIndex: currentQuestionIndex,
        userId: props.userId,
        optionIndex: index,
        usedItemId: itemId || null,
      };
      await setAnswer(props.gameId, answer);
    },
    [props.gameId, props.userId, currentQuestionIndex]
  );

  return (
    <div className={styles.questionPage}>
      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <div className={styles.content_tag}>
            {currentQuestionIndex}/{game.questions.length - 1}
          </div>
          <div className={styles.content_title}>{currentQuestion.question}</div>
          {showAnswer ? (
            <div className={styles.content_result}>
              {selectedAnswerIndex === currentQuestion.correctIndex ? (
                <Image src={UserResultCorrectGif} alt="sample question" />
              ) : (
                <Image src={UserResultIncorrectGif} alt="sample question" />
              )}
            </div>
          ) : (
            <div className={styles.content_image}>
              <StorageImage
                path={currentQuestion.imagePath}
                alt="sample question"
                width={275}
                height={183}
              />
            </div>
          )}
          <div className={styles.content_answers}>
            {currentQuestion.options.map((option, index) => (
              <AnswerItem
                key={index}
                label={String.fromCharCode(65 + index)}
                text={option}
                isDisabled={
                  showAnswer ? currentQuestion.correctIndex !== index : false
                }
                onClick={() => {
                  if (showAnswer) return;
                  // if (selectedAnswerIndex) return;
                  submitAnswer(index, selectedItemId ?? null);
                }}
                isSelected={selectedAnswerIndex === index}
              />
            ))}
          </div>
          {/* <div className={styles.content_timer}>
            <Image src={IconTimer} alt="time" />
            <Indicator answerTime={game.answerTime} />
          </div> */}
        </div>
      </div>
      <div className={styles.foot}>
        <div className={styles.items}>
          {ownItems?.map((item) => (
            <ItemBox
              key={item.itemId}
              image={
                <StorageImage
                  path={item.image}
                  alt="item"
                  width={60}
                  height={55}
                />
              }
              name={item.name}
              description={item.description}
              isUsed={ownAnswers.some(
                (answer) =>
                  answer.usedItemId === item.itemId &&
                  selectedItemId !== item.itemId
              )}
              isUsing={selectedItemId === item.itemId}
              onUse={() => {
                if (!selectedAnswerIndex) return;
                submitAnswer(selectedAnswerIndex, item.itemId);
              }}
              onCancel={() => {
                if (!selectedAnswerIndex) return;
                if (selectedItemId !== item.itemId) return;
                submitAnswer(selectedAnswerIndex, null);
              }}
              game={game}
              isAnswerSelected={selectedAnswerIndex !== undefined}
              overrideButton={
                currentQuestionIndex === 0
                  ? {
                      text: "例題には使えないよ！",
                      isDisabled: true,
                    }
                  : undefined
              }
            />
          ))}
          {Array.from({ length: 3 - (ownItems?.length || 0) }).map(
            (_, index) => (
              <ItemBox key={index} />
            )
          )}
        </div>
        <div className={styles.status}>
          <div className={styles.status_point}>ポイント:{user?.score}</div>
          <div className={styles.status_rate}>
            正解率:
            {correctRate() === null
              ? "-"
              : Math.round(correctRate()! * 100) + "%"}
          </div>
        </div>
      </div>
    </div>
  );
}

type AnswerItemProps = {
  label: string;
  text: string;
  onClick?: () => void;
  isDisabled?: boolean;
  isSelected?: boolean;
};

function AnswerItem(props: AnswerItemProps) {
  return (
    <div
      className={`${styles.answerItem} ${
        props.isDisabled ? styles.disabled : ""
      } ${props.isSelected ? styles.selected : ""}`}
      onClick={props.onClick}
    >
      <div className={styles.answerItem_label}>{props.label}</div>
      <div className={styles.answerItem_text}>{props.text}</div>
    </div>
  );
}

type ItemBoxProps = {
  image?: ReactNode;
  name?: string;
  description?: string;
  isUsed?: boolean;
  canUse?: boolean;
  isUsing?: boolean;
  onUse?: () => void;
  onCancel?: () => void;
  game?: Game;
  isAnswerSelected?: boolean;
  overrideButton?: {
    text: string;
    isDisabled?: boolean;
  };
};

function ItemBox(props: ItemBoxProps) {
  const button = useCallback(() => {
    if (props.overrideButton) {
      return props.overrideButton;
    }
    if (props.game?.currentProcess.type !== "question") {
      return undefined;
    }

    if (!props.isAnswerSelected) {
      return { text: "先に答えを選択しよう！", isDisabled: true };
    }

    if (props.isUsed) {
      return { text: "使用済み", isDisabled: true };
    }

    return { text: "アイテムを使う", isDisabled: false };
  }, [props.isUsed, props.overrideButton, props.game, props.isAnswerSelected]);

  const [isOpen, setIsOpen] = useState(false);

  if (!props.image || !props.name || !props.description) {
    return <div className={styles.itemBox}></div>;
  }
  return (
    <>
      <div
        className={`${styles.itemBox} ${props.isUsed ? styles.used : ""} ${
          props.isUsing ? styles.highlight : ""
        }`}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {props.image}
      </div>
      {isOpen && (
        <ItemDetailModal
          image={props.image}
          name={props.name}
          description={props.description}
          onClose={() => {
            setIsOpen(false);
          }}
          isUsed={props.isUsed}
          onUse={() => {
            setIsOpen(false);
            props.onUse?.();
          }}
          onCancel={() => {
            props.onCancel?.();
          }}
          button={button()}
        />
      )}
    </>
  );
}

async function setAnswer(gameId: string, answer: Answer) {
  const ref = documentSet(
    AnswerSchema,
    `Games/${gameId}/Answers`,
    answer.answerId
  );
  await setDoc(ref, answer);
}
