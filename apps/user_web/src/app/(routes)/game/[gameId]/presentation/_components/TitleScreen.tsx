import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./TitleScreen.module.css";
import { GameScreen } from "../page";
import HomeItemBoxImg from "../../../../../_images/HomeItemBox.png";
import HomeLogoImg from "../../../../../_images/HomeLogo.png";
import MainCharactersBox from "../../../../../_components/MainCharactersBox/MainCharactersBox";
import FumiyaImg from "../../../../../_images/Fumiya.png";
import AoiImg from "../../../../../_images/Aoi.png";
import { AnimatePresence, motion } from "framer-motion";

interface TitleScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ gameId, onNavigate }) => {
  const [animationStage, setAnimationStage] = useState<
    "initial" | "moved" | "complete"
  >("initial");

  useEffect(() => {
    // 段階的アニメーションのタイミング制御
    const timer1 = setTimeout(() => setAnimationStage("moved"), 1000);
    const timer2 = setTimeout(() => setAnimationStage("complete"), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "Enter") {
        onNavigate("waiting");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNavigate]);

  const fumiyaImage = (
    <Image src={FumiyaImg} alt="Fumiya" style={{ objectFit: "cover" }} />
  );
  const aoiImage = (
    <Image src={AoiImg} alt="Aoi" style={{ objectFit: "cover" }} />
  );

  return (
    <main className={styles.bg}>
      <div className={styles.container}>
        <AnimatePresence>
          <motion.div
            initial={{ x: "-100%", opacity: 0, scale: 1.8, y: "20vh" }}
            animate={{
              x: animationStage === "initial" ? ["-100%", "10%", 0] : 0,
              y:
                animationStage === "moved" || animationStage === "complete"
                  ? 0
                  : "20vh",
              scale:
                animationStage === "moved" || animationStage === "complete"
                  ? 1
                  : 1.8,
              opacity: 1,
            }}
            transition={{
              duration: animationStage === "initial" ? 0.8 : 0.6,
              ease: "easeOut",
              delay: animationStage === "moved" ? 0.2 : 0,
            }}
          >
            <Image
              src={HomeLogoImg}
              alt="Quiz Kart Logo"
              className={styles.logo}
              width={500}
              height={150}
              placeholder="blur"
            />
          </motion.div>
        </AnimatePresence>

        {/* ItemBox 1: 左上 */}
        <motion.div
          className={styles.itemBox1}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{
            opacity: animationStage === "complete" ? 1 : 0,
            scale: animationStage === "complete" ? 1 : 0,
            rotate: animationStage === "complete" ? 0 : -180,
          }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Image
            src={HomeItemBoxImg}
            alt="Item Box 1"
            layout="responsive"
            width={100}
            height={100}
            placeholder="blur"
          />
        </motion.div>

        {/* ItemBox 2: 右真ん中ちょい上 */}
        <motion.div
          className={styles.itemBox2}
          initial={{ opacity: 0, scale: 0, rotate: 180 }}
          animate={{
            opacity: animationStage === "complete" ? 1 : 0,
            scale: animationStage === "complete" ? 1 : 0,
            rotate: animationStage === "complete" ? 30 : 180,
          }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <Image
            src={HomeItemBoxImg}
            alt="Item Box 2"
            layout="responsive"
            width={80}
            height={80}
            placeholder="blur"
          />
        </motion.div>

        {/* ItemBox 3: 左下、1つ目より右 */}
        <motion.div
          className={styles.itemBox3}
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={{
            opacity: animationStage === "complete" ? 1 : 0,
            scale: animationStage === "complete" ? 1 : 0,
            rotate: animationStage === "complete" ? 0 : -90,
          }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
        >
          <Image
            src={HomeItemBoxImg}
            alt="Item Box 3"
            layout="responsive"
            width={130}
            height={130}
            placeholder="blur"
          />
        </motion.div>

        <motion.div
          className={styles.mainCharactersContainer}
          initial={{ opacity: 0, y: "10vh" }}
          animate={{
            opacity: animationStage === "complete" ? 1 : 0,
            y: animationStage === "complete" ? 0 : "10vh",
          }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <MainCharactersBox
            leftImage={fumiyaImage}
            leftName="FUMIYA"
            rightImage={aoiImage}
            rightName="AOI"
            size="large"
          />
        </motion.div>
      </div>
    </main>
  );
};

export default TitleScreen;
