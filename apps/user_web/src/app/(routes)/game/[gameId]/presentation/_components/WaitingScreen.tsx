import React, { useEffect } from "react";
import Image from "next/image";
import styles from "./WaitingScreen.module.css";
import { GameScreen } from "../page";
import { AnimatePresence, motion } from "framer-motion";

interface WaitingScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({
  gameId,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "Enter") {
        onNavigate("quiz");
      } else if (event.key === "ArrowLeft") {
        onNavigate("title");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNavigate]);

  const items = [
    {
      name: "ダッシュキノコ",
      description: "クイズ正解時に得点ブースト",
      image: "/images/dash-kinoko.png",
      alt: "ダッシュキノコ",
    },
    {
      name: "ボム兵",
      description: "上位チームに爆発ダメージ",
      image: "/images/bomb.png",
      alt: "ボム兵",
    },
    {
      name: "キラー",
      description: "キラーに変身し、ものすごい追い上げができる",
      image: "/images/killer.png",
      alt: "キラー",
    },
    {
      name: "ランダムこうら",
      description: "謎の力が秘められた甲羅",
      image: "/images/koura.png",
      alt: "ランダム甲羅",
    },
  ];

  return (
    <main className={styles.bg}>
      <div className={styles.modal}>
        <div className={styles.headingImageContainer}>
          <Image
            src="/images/item-page-logo.png"
            alt="アイテム"
            width={300}
            height={100}
            className={styles.headingImage}
          />
        </div>
        <div className={styles.itemsGrid}>
          {items.map((item, index) => (
            <AnimatePresence key={item.name}>
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.2 + index * 0.25,
                }}
                exit={{ x: -100, opacity: 0 }}
              >
                <div className={styles.item}>
                  <div className={styles.itemImageContainer}>
                    <Image
                      src={item.image}
                      alt={item.alt}
                      className={styles.itemImage}
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className={styles.itemTextContainer}>
                    <p className={styles.itemName}>「{item.name}」</p>
                    <p className={styles.itemDescription}>{item.description}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
        <div className={styles.jugemImageContainer}>
          <AnimatePresence>
            <motion.div
              initial={{ x: 0, y: 0 }}
              animate={{ x: [-5, 5, -5], y: [-15, 15, -15] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                repeatType: "loop",
              }}
            >
              <Image
                src="/images/jugem.png"
                alt="ジュゲム"
                width={150}
                height={150}
                className={styles.jugemImage}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default WaitingScreen;
