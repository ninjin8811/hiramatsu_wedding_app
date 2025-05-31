import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from './WaitingScreen.module.css';
import { GameScreen } from '../page';

interface WaitingScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({ gameId, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        onNavigate('quiz');
      } else if (event.key === 'ArrowLeft') {
        onNavigate('title');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNavigate]);

  const items = [
    {
      name: 'アカこうら',
      description: '前の人が -10pt',
      image: '/images/akakoura.png',
      alt: 'アカこうら',
    },
    {
      name: 'ダッシュキノコ',
      description: '+5pt進む',
      image: '/images/dash-kinoko.png',
      alt: 'ダッシュキノコ',
    },
    {
      name: 'キラー',
      description: '+30pt進む',
      image: '/images/killer.png',
      alt: 'キラー',
    },
    {
      name: 'トゲゾーこうら',
      description: '1番前の人が -20pt',
      image: '/images/togezo.png',
      alt: 'トゲゾーこうら',
    },
  ];

  return (
    <main className={styles.bg}>
      <div className={styles.modal}>
        <div className={styles.headingImageContainer}>
          <Image src="/images/item-page-logo.png" alt="アイテム" width={300} height={100} className={styles.headingImage} />
        </div>
        <div className={styles.itemsGrid}>
          {items.map((item) => (
            <div key={item.name} className={styles.item}>
              <div className={styles.itemImageContainer}>
                <Image src={item.image} alt={item.alt} className={styles.itemImage} width={100} height={100} />
              </div>
              <div className={styles.itemTextContainer}>
                <p className={styles.itemName}>「{item.name}」</p>
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.jugemImageContainer}>
          <Image src="/images/jugem.png" alt="ジュゲム" width={150} height={150} className={styles.jugemImage} />
        </div>
      </div>
    </main>
  );
};

export default WaitingScreen;