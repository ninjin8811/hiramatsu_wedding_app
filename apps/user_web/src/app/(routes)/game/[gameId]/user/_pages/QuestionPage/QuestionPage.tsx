"use client";
import Image from "next/image";
import styles from "./QuestionPage.module.scss";
import SampleQuestionImage from "@/app/_images/SampleQuestionImage.png";
import IconTimer from "@/app/_images/IconTimer.png";
import ItemAkakora from "@/app/_images/ItemAkakora.png";
import UserResultCorrect from "@/app/_images/UserResultCorrect.png";
import UserResultIncorrect from "@/app/_images/UserResultIncorrect.png";
import ItemDetailModal from "@user/_components/ItemDetailModal/ItemDetailModal";
import { ReactNode, useEffect, useState } from "react";
import { Game, GameSchema, Item } from "@/app/_types";
import { onSnapshot } from "firebase/firestore";
import { documentGet } from "@/app/_lib/firebase/ClientConverter";
import StorageImage from "../../_components/StorageImage/StorageImage";
import Indicator from "./QuestionIndicator";

type Props = {
  gameId: string;
  userId: string;
  game: Game;
  items: Item[];
};

export default function QuestionPage(props: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [game, setGame] = useState<Game>(props.game);

  const currentQuestionIndex = game.currentProcess.index;
  const currentQuestion = game.questions[currentQuestionIndex];

  const user = props.game.users.find((user) => user.id === props.userId);
  const ownItems = props.items.filter((item) =>
    user?.itemIds.includes(item.itemId)
  );

  useEffect(() => {
    const ref = documentGet(GameSchema, `Games`, props.gameId);
    onSnapshot(ref, (snapshot) => {
      const game = snapshot.data() as Game;
      setGame(game);
    });
  }, [props.gameId]);

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
              <Image src={UserResultCorrect} alt="sample question" />
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
                isDisabled={showAnswer ? true : false}
                onClick={() => setShowAnswer(true)}
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
              image={<StorageImage path={item.image} alt="item" />}
              name={item.name}
              description={item.description}
            />
          ))}
          {Array.from({ length: 3 - ownItems.length }).map((_, index) => (
            <ItemBox key={index} />
          ))}
        </div>
        <div className={styles.status}>
          <div className={styles.status_point}>ポイント:40pt</div>
          <div className={styles.status_rate}>正解率:70%</div>
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
};

function AnswerItem(props: AnswerItemProps) {
  return (
    <div
      className={`${styles.answerItem} ${
        props.isDisabled ? styles.disabled : ""
      }`}
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
};

function ItemBox(props: ItemBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!props.image || !props.name || !props.description) {
    return <div className={styles.itemBox}></div>;
  }
  return (
    <>
      <div className={styles.itemBox} onClick={() => setIsOpen(true)}>
        {props.image}
      </div>
      {isOpen && (
        <ItemDetailModal
          image={props.image}
          name={props.name}
          description={props.description}
          canUse={true}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// type IndicatorProps = {
//   answerTime: number;
// };

// function Indicator(props: IndicatorProps) {
//   const [timer, setTimer] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer((t) => t + 0.05);
//     }, 50);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className={styles.indicator}>
//       <div
//         className={styles.indicator_active}
//         style={{
//           width: `${(timer / props.answerTime) * 100}%`,
//         }}
//       />
//     </div>
//   );
// }
