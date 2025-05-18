import React from 'react';
import Image from 'next/image';
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
  thumbnail: string; // This will be the HTTPS URL
}

const RankingItemGorgeous: React.FC<RankingItemGorgeousProps> = ({
  rank,
  name,
  score,
  thumbnail, // This is now an HTTPS URL
}) => {
  // const getFirebaseStorageUrl = (gsUri: string): string => {
  //   if (!gsUri || !gsUri.startsWith('gs://')) {
  //     // Return a placeholder or empty string if the URI is invalid
  //     // console.error('Invalid GS URI:', gsUri);
  //     return ''; // Or a path to a default placeholder image
  //   }
  //   const bucketAndPath = gsUri.substring(5); // Remove 'gs://'
  //   const parts = bucketAndPath.split('/');
  //   const bucketName = parts.shift();
  //   const objectPath = parts.join('/');
  //   if (!bucketName || !objectPath) {
  //       // console.error('Could not parse bucket name or object path from GS URI:', gsUri);
  //       return '';
  //   }
  //   return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media`;
  // };

  const imageUrl = thumbnail; // Directly use the thumbnail prop

  return (
    <div className={styles.rankingItemGorgeous} data-rank={rank}>
      <div className={styles.thumbnailContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl} // Use the transformed HTTPS URL
            alt={`${name} thumbnail`}
            width={120}
            height={120}
            className={styles.mainThumbnail}
            // priority={rank <=3 } // Consider adding priority for top-ranked images if needed
          />
        ) : (
          <div className={styles.thumbnailPlaceholder} style={{ width: 120, height: 120, backgroundColor: '#ccc' }}>
            {/* You can put an icon or text here as a placeholder */}
          </div>
        )}
        <div className={styles.rankOverlay}>
          <Image
            src={rankImages[rank.toString() as keyof typeof rankImages]}
            alt={`Rank ${rank}`}
            width={60}
            height={60}
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