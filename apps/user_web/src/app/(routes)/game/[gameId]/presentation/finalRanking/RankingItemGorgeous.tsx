import React from 'react';
import Image, { StaticImageData } from 'next/image';
import styles from './RankingItem.module.scss';

// 順位の画像をインポート
import Number1 from '@/app/_images/Number1.png';
import Number2 from '@/app/_images/Number2.png';
import Number3 from '@/app/_images/Number3.png';
import Number4 from '@/app/_images/Number4.png';
import Number5 from '@/app/_images/Number5.png';
import Number6 from '@/app/_images/Number6.png';
import Number7 from '@/app/_images/Number7.png';
import Number8 from '@/app/_images/Number8.png';
import Number9 from '@/app/_images/Number9.png';
import Number10 from '@/app/_images/Number10.png';
import Number11 from '@/app/_images/Number11.png';
import Number12 from '@/app/_images/Number12.png';
import Number13 from '@/app/_images/Number13.png';
import Number14 from '@/app/_images/Number14.png';
import Number15 from '@/app/_images/Number15.png';

const rankImages = {
  '1': Number1,
  '2': Number2,
  '3': Number3,
  '4': Number4,
  '5': Number5,
  '6': Number6,
  '7': Number7,
  '8': Number8,
  '9': Number9,
  '10': Number10,
  '11': Number11,
  '12': Number12,
  '13': Number13,
  '14': Number14,
  '15': Number15,
};

interface RankingItemGorgeousProps {
  rank: number;
  name: string;
  score: number;
  thumbnail: StaticImageData;
}

const RankingItemGorgeous: React.FC<RankingItemGorgeousProps> = ({
  rank,
  name,
  score,
  thumbnail,
}) => {
  return (
    <div className={styles.rankingItemGorgeous} data-rank={rank}>
      <div className={styles.thumbnailContainer}>
        <Image
          src={thumbnail}
          alt={`${name} thumbnail`}
          width={120}
          height={120}
          className={styles.mainThumbnail}
        />
        <div className={styles.rankOverlay}>
          <Image
            src={rankImages[rank.toString() as keyof typeof rankImages]}
            alt={`Rank ${rank}`}
            width={40}
            height={40}
            className={styles.rankImageGorgeous}
          />
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.teamNameGorgeous}>{name}</div>
        <div className={styles.scoreContainerGorgeous}>
          <span className={styles.scoreGorgeous}>{score}</span>
          <span className={styles.unitGorgeous}>pt</span>
        </div>
      </div>
    </div>
  );
};

export default RankingItemGorgeous; 