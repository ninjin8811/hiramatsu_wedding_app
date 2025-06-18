"use client";
import HomeLogo from "@/app/_images/HomeLogo.png";
import Background from "@/app/_images/Background.png";
import HomeItemBox from "@/app/_images/HomeItemBox.png";
import Image from "next/image";
import styles from "./StartPage.module.scss";
import MainCharactersBox from "@/app/_components/MainCharactersBox/MainCharactersBox";
import FumiyaImage from "@/app/_images/Fumiya.png";
import AoiImage from "@/app/_images/Aoi.png";
import CommonButton from "../../_components/CommonButton/CommonButton";
import Link from "next/link";
import { UserPreparePath } from "@/app/_utils/page_link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useClientReplace } from "../../_utils/useClientReplace";

type Props = {
  gameId: string;
  userId: string;
};

export default function StartPage(props: Props) {
  const [animationStage, setAnimationStage] = useState<
    "initial" | "moved" | "complete"
  >("initial");

  useClientReplace(props.gameId, props.userId, "created");

  useEffect(() => {
    // 段階的アニメーションのタイミング制御
    const timer1 = setTimeout(() => setAnimationStage("moved"), 1000);
    const timer2 = setTimeout(() => setAnimationStage("complete"), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className={styles.startPage}>
      <div className={styles.background}>
        <Image
          src={Background}
          alt="start"
          className={styles.background_main}
        />
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            className={styles.background_item}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: Math.random() * 720 - 540,
            }}
            animate={{
              opacity: animationStage === "complete" ? 1 : 0,
              scale: animationStage === "complete" ? 1 : 0,
              rotate:
                animationStage === "complete"
                  ? Math.random() * 720 - 540
                  : Math.random() * 720 - 540,
            }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <Image src={HomeItemBox} alt="start" />
          </motion.div>
        ))}
      </div>
      <div className={styles.content}>
        <motion.div
          initial={{ x: "-100%", opacity: 0, scale: 1.2, y: "20vh" }}
          animate={{
            x: animationStage === "initial" ? ["-100%", "10%", 0] : 0,
            y:
              animationStage === "moved" || animationStage === "complete"
                ? 0
                : "20vh",
            scale:
              animationStage === "moved" || animationStage === "complete"
                ? 1
                : 1.2,
            opacity: 2,
          }}
          transition={{
            duration: animationStage === "initial" ? 0.8 : 0.6,
            ease: "easeOut",
            delay: animationStage === "moved" ? 0.2 : 0,
          }}
        >
          <Image src={HomeLogo} alt="start" className={styles.logo} />
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
            leftImage={<Image src={FumiyaImage} alt="left" />}
            leftName="FUMIYA"
            rightImage={<Image src={AoiImage} alt="right" />}
            rightName="AOI"
            size="small"
          />
        </motion.div>
      </div>
      <Link
        href={UserPreparePath(props.gameId, props.userId)}
        className={styles.button}
      >
        <CommonButton color="blue">次へ</CommonButton>
      </Link>
    </div>
  );
}
