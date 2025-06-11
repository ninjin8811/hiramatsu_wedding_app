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
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className={styles.indicator}>
      <div
        className={styles.indicator_active}
        style={{
          width: `${Math.max(1 - timer / props.answerTime, 0) * 100}%`,
        }}
      />
    </div>
  );
}
