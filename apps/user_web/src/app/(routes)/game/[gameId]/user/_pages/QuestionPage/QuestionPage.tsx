"use client";
import Image from "next/image";
import styles from "./QuestionPage.module.scss";
import SampleQuestionImage from "@/app/_images/SampleQuestionImage.png";
import IconTimer from "@/app/_images/IconTimer.png";
import ItemAkakora from "@/app/_images/ItemAkakora.png";
import UserResultCorrect from "@/app/_images/UserResultCorrect.png";
import UserResultIncorrect from "@/app/_images/UserResultIncorrect.png";
import ItemDetailModal from "@user/_components/ItemDetailModal/ItemDetailModal";
import { useState } from "react";

export default function QuestionPage() {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className={styles.questionPage}>
      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <div className={styles.content_tag}>2/8</div>
          <div className={styles.content_title}>
            {"出会ってから何年経つ？\n（最大文字数23文字）"}
          </div>
          {showAnswer ? (
            <div className={styles.content_result}>
              <Image src={UserResultCorrect} alt="sample question" />
            </div>
          ) : (
            <div className={styles.content_image}>
              <Image src={SampleQuestionImage} alt="sample question" />
            </div>
          )}
          <div className={styles.content_answers}>
            <AnswerItem
              label="A"
              text="10年"
              onClick={() => setShowAnswer(true)}
            />
            <AnswerItem label="B" text="10年" />
            <AnswerItem label="C" text="10年" />
            <AnswerItem label="D" text="10年" />
          </div>
          <div className={styles.content_timer}>
            <Image src={IconTimer} alt="time" />
            <div className={styles.indicator}>
              <div
                className={styles.indicator_active}
                style={{
                  width: "80%",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.foot}>
        <div className={styles.items}>
          <div className={styles.items_item}>
            <Image src={ItemAkakora} alt="item" />
          </div>
          <div className={styles.items_item}>
            <Image src={ItemAkakora} alt="item" />
          </div>
          <div className={styles.items_item}>
            {/* <Image src={ItemAkakora} alt="item" /> */}
          </div>
        </div>
        <div className={styles.status}>
          <div className={styles.status_point}>ポイント:40pt</div>
          <div className={styles.status_rate}>正解率:70%</div>
        </div>
      </div>
      <ItemDetailModal
        image={<Image src={ItemAkakora} alt="item" />}
        name="アカコラ"
        description="アカコラは、アカコラの説明です。"
        canUse={true}
        onClose={() => {}}
      />
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
