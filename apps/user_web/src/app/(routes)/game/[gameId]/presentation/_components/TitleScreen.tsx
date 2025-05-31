import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from './TitleScreen.module.css';
import { GameScreen } from '../page';
import HomeItemBoxImg from '../../../../../_images/HomeItemBox.png';
import HomeLogoImg from '../../../../../_images/HomeLogo.png';
import MainCharactersBox from '../../../../../_components/MainCharactersBox/MainCharactersBox';
import FumiyaImg from '../../../../../_images/Fumiya.png';
import AoiImg from '../../../../../_images/Aoi.png';


interface TitleScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ gameId, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        onNavigate('waiting');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // クリーンアップ関数
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNavigate]); // onNavigate が変更された場合にのみエフェクトを再実行

  const fumiyaImage = (
    <Image src={FumiyaImg} alt="Fumiya"style={{ objectFit: 'cover' }} />
  );
  const aoiImage = (
    <Image src={AoiImg} alt="Aoi" style={{ objectFit: 'cover' }} />
  );

  return (
    <main className={styles.bg}>
      <div className={styles.container}>
        <Image src={HomeLogoImg} alt="Quiz Kart Logo" className={styles.logo} width={500} height={150} placeholder="blur" />

        {/* ItemBox 1: 左上 */}
        <div className={styles.itemBox1}>
          <Image src={HomeItemBoxImg} alt="Item Box 1" layout="responsive" width={100} height={100} placeholder="blur" />
        </div>

        {/* ItemBox 2: 右真ん中ちょい上 */}
        <div className={styles.itemBox2}>
          <Image src={HomeItemBoxImg} alt="Item Box 2" layout="responsive" width={80} height={80} placeholder="blur" />
        </div>

        {/* ItemBox 3: 左下、1つ目より右 */}
        <div className={styles.itemBox3}>
          <Image src={HomeItemBoxImg} alt="Item Box 3" layout="responsive" width={130} height={130} placeholder="blur" />
        </div>

        <div className={styles.mainCharactersContainer}>
          <MainCharactersBox
            leftImage={fumiyaImage}
            leftName="FUMIYA"
            rightImage={aoiImage}
            rightName="AOI"
            size="large"
          />
        </div>
      </div>
    </main>
  );
};

export default TitleScreen;