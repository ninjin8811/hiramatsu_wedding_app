"use client";
import styles from "./QuestionPage.module.scss";
import { useEffect, useState } from "react";

type IndicatorProps = {
  answerTime: number;
};

export default function Indicator(props: IndicatorProps) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => t + 0.2);
    }, 200);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className={styles.indicator}>
      <div
        className={styles.indicator_active}
        style={{
          width: `${(timer / props.answerTime) * 100}%`,
        }}
      />
    </div>
  );
}
