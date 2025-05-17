import { useState, useEffect } from "react";
import styles from './QuizScreen.module.css';
import Image from "next/image";

type Props = {
  timeLimit: number;
  onTimeUp: () => void;
}

export const QuizScreenTimer = ({ timeLimit, onTimeUp }: Props) => {
  const [remainTime, setRemainTime] = useState<number | undefined>(timeLimit);
  const timerPercentage = remainTime ?(remainTime / timeLimit) * 100 : 0;

  useEffect(() => {
    if (remainTime == null) return

    const timerId = setInterval(() => {
      setRemainTime((prevTime) => prevTime ? prevTime - 0.1 : undefined);
      if (remainTime <= 0) {
        onTimeUp();
        setRemainTime(undefined);
      }
    }, 100);

    return () => clearInterval(timerId);
  }, [remainTime, onTimeUp]);

  return (
    <div className={styles.timerContainer}>
      <Image
          src="/images/time.png"
          className={styles.timerIcon}
          alt="タイマーアイコン"
          width={24}
          height={24}
        />
      <div className={styles.timerBar}>
        {timerPercentage != null && (
          <div
            className={styles.timerProgress}
            style={{ width: `${timerPercentage}%` }}
          />
        )}
      </div>
    </div>
  )
}