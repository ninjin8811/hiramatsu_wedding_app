import React from "react";
import Image from "next/image";
import styles from "./RankingItem.module.scss";

// 順位の画像をインポート
import Number1 from "@/app/_images/Number1.png";
import Number2 from "@/app/_images/Number2.png";
import Number3 from "@/app/_images/Number3.png";
import Number4 from "@/app/_images/Number4.png";
import Number5 from "@/app/_images/Number5.png";
import Number6 from "@/app/_images/Number6.png";
import Number7 from "@/app/_images/Number7.png";
import Number8 from "@/app/_images/Number8.png";
import Number9 from "@/app/_images/Number9.png";
import Number10 from "@/app/_images/Number10.png";
import Number11 from "@/app/_images/Number11.png";
import Number12 from "@/app/_images/Number12.png";
import Number13 from "@/app/_images/Number13.png";
import Number14 from "@/app/_images/Number14.png";
import Number15 from "@/app/_images/Number15.png";

const rankImages = {
  "1": Number1,
  "2": Number2,
  "3": Number3,
  "4": Number4,
  "5": Number5,
  "6": Number6,
  "7": Number7,
  "8": Number8,
  "9": Number9,
  "10": Number10,
  "11": Number11,
  "12": Number12,
  "13": Number13,
  "14": Number14,
  "15": Number15,
};

interface RankingItemProps {
  rank: number;
  name: string;
  score: number;
  thumbnail: string;
}

const RankingItemNormal: React.FC<RankingItemProps> = ({
  rank,
  name,
  score,
  thumbnail,
}) => {
  return (
    <div className={styles.rankingItem}>
      <div className={styles.rankNumber}>
        <Image
          src={rankImages[rank.toString() as keyof typeof rankImages]}
          alt={`Rank ${rank}`}
          width={48}
          height={48}
          className={styles.rankImage}
        />
      </div>
      <Image
        src={thumbnail}
        className={styles.normalItemThumbnail}
        alt={name}
        width={48}
        height={48}
      />
      <div className={styles.teamName}>{name}</div>
      <div style={{ flex: 1 }}></div>
      <div className={styles.scoreContainer}>
        <span className={styles.score}>{score}</span>
        <span className={styles.unit}>pt</span>
      </div>
    </div>
  );
};

export default RankingItemNormal;
