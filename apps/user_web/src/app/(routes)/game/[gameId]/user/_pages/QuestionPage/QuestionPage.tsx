"use client";
import Image from "next/image";
import styles from "./QuestionPage.module.scss";
import IconTimer from "@/app/_images/IconTimer.png";
import UserResultCorrect from "@/app/_images/UserResultCorrect.png";
import UserResultIncorrect from "@/app/_images/UserResultIncorrect.png";
import ItemDetailModal from "@user/_components/ItemDetailModal/ItemDetailModal";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Answer, AnswerSchema, Game, GameSchema, Item } from "@/app/_types";
import { onSnapshot, query, setDoc, where } from "firebase/firestore";
import {
  collectionGet,
  documentGet,
  documentSet,
} from "@/app/_lib/firebase/ClientConverter";
import StorageImage from "../../_components/StorageImage/StorageImage";
import Indicator from "./QuestionIndicator";
import { randomUUID } from "crypto";
import { useRouter } from "next/navigation";
import { UserResultPath } from "@/app/_utils/page_link";

type Props = {
  gameId: string;
  userId: string;
  game: Game;
  items: Item[];
};

export default function QuestionPage(props: Props) {
  const [game, setGame] = useState<Game>(props.game);

  const currentQuestionIndex = game.currentProcess.index;
  const currentQuestion = game.questions[currentQuestionIndex];
  const showAnswer = game.currentProcess.type !== "question";

  const user = props.game.users.find((user) => user.id === props.userId);
  const ownItems = props.items.filter((item) =>
    user?.itemIds.includes(item.itemId)
  );
  const [ownAnswers, setOwnAnswers] = useState<Answer[]>([]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>();

  const selectedAnswerIndex = ownAnswers.find(
    (answer) => answer.questionIndex === currentQuestionIndex
  )?.optionIndex;

  const correctRate = useCallback(() => {
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

  const { replace } = useRouter();

  useEffect(() => {
    const unsub = listenGame(props.gameId, (game) => setGame(game));
    return () => unsub();
  }, [props.gameId]);

  useEffect(() => {
    const unsub = listenAnswers(props.gameId, props.userId, (answers) => {
      setOwnAnswers(answers);
    });
    return () => unsub();
  }, [props.gameId, props.userId]);

  async function submitAnswer(index: number) {
    const answer = {
      answerId: props.userId + "_" + currentQuestionIndex,
      questionIndex: currentQuestionIndex,
      userId: props.userId,
      optionIndex: index,
      usedItemId: selectedItemId || null,
    };
    await setAnswer(props.gameId, answer);
  }

  useEffect(() => {
    if (game.status === "completed") {
      replace(UserResultPath(props.gameId, props.userId));
    }
  }, [game.status, props.gameId, props.userId, replace]);

  return (
    <div className={styles.questionPage}>
      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <div className={styles.content_tag}>
            {currentQuestionIndex + 1}/{game.questions.length}
          </div>
          <div className={styles.content_title}>{currentQuestion.question}</div>
          {showAnswer ? (
            <div className={styles.content_result}>
              {selectedAnswerIndex === currentQuestion.correctIndex ? (
                <Image src={UserResultCorrect} alt="sample question" />
              ) : (
                <Image src={UserResultIncorrect} alt="sample question" />
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
                  submitAnswer(index);
                }}
                isSelected={selectedAnswerIndex === index}
              />
            ))}
          </div>
          <div className={styles.content_timer}>
            <Image src={IconTimer} alt="time" />
            <Indicator answerTime={game.answerTime} />
          </div>
        </div>
      </div>
      <div className={styles.foot}>
        <div className={styles.items}>
          {ownItems.map((item) => (
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
                setSelectedItemId(item.itemId);
                if (selectedAnswerIndex) {
                  submitAnswer(selectedAnswerIndex);
                }
              }}
              canUse={true}
            />
          ))}
          {Array.from({ length: 3 - ownItems.length }).map((_, index) => (
            <ItemBox key={index} />
          ))}
        </div>
        <div className={styles.status}>
          <div className={styles.status_point}>ポイント:{user?.score}</div>
          <div className={styles.status_rate}>
            正解率:{correctRate() ? correctRate() * 100 + "%" : "-"}
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
};

function ItemBox(props: ItemBoxProps) {
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
          canUse={props.canUse}
          onClose={() => setIsOpen(false)}
          isUsed={props.isUsed}
          onUse={() => {
            setIsOpen(false);
            props.onUse?.();
          }}
        />
      )}
    </>
  );
}

function listenGame(gameId: string, callback: (game: Game) => void) {
  const ref = documentGet(GameSchema, `Games`, gameId);
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.data() as Game);
  });
}

async function setAnswer(gameId: string, answer: Answer) {
  const ref = documentSet(
    AnswerSchema,
    `Games/${gameId}/Answers`,
    answer.answerId
  );
  await setDoc(ref, answer);
}

function listenAnswers(
  gameId: string,
  userId: string,
  callback: (answers: Answer[]) => void
) {
  const ref = collectionGet(AnswerSchema, `Games/${gameId}/Answers`);
  return onSnapshot(query(ref, where("userId", "==", userId)), (snapshot) => {
    console.log(snapshot.docs.map((doc) => doc.data()));
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}
