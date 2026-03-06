"use client"
import HomeLogo from "@/app/_images/HomeLogo.png"
import Background from "@/app/_images/Background.png"
import HomeItemBox from "@/app/_images/HomeItemBox.png"
import Image from "next/image"
import styles from "./StartPage.module.scss"
import MainCharactersBox from "@/app/_components/MainCharactersBox/MainCharactersBox"
import YutoImage from "@/app/_images/Yuto.jpg"
import NatsumiImage from "@/app/_images/Natsumi.jpg"
import CommonButton from "../../_components/CommonButton/CommonButton"
import Link from "next/link"
import { UserPreparePath } from "@/app/_utils/page_link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useClientReplace } from "../../_utils/useClientReplace"

type Props = {
  gameId: string
  userId: string
}

export default function StartPage(props: Props) {
  const [animationStage, setAnimationStage] = useState<
    "initial" | "moved" | "complete"
  >("initial")

  useClientReplace(props.gameId, props.userId, "created")

  useEffect(() => {
    // 段階的アニメーションのタイミング制御
    const timer1 = setTimeout(() => setAnimationStage("moved"), 1000)
    const timer2 = setTimeout(() => setAnimationStage("complete"), 1800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className={styles.startPage}>
      <div className={styles.background}>
        <motion.div
          className={styles.background_main}
          animate={{
            x: ["-50%", "0%"],
            y: ["-50%", "0%"],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}>
          {/* 画像サイズ750x1624px（縦長）を考慮した3x3グリッド配置 */}
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: 0, left: "33.33%" }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: 0, left: "66.66%" }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: "33.33%", left: 0 }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: "33.33%", left: "33.33%" }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: "33.33%", left: "66.66%" }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: "66.66%", left: 0 }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: "66.66%", left: "33.33%" }}
          />
          <Image
            src={Background}
            alt="background"
            className={styles.background_image}
            style={{ position: "absolute", top: "66.66%", left: "66.66%" }}
          />
        </motion.div>
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
              y:
                animationStage === "complete"
                  ? index === 0
                    ? [0, -15, 0]
                    : index === 1
                      ? [0, -12, 0]
                      : [0, -18, 0]
                  : 0,
              x:
                animationStage === "complete"
                  ? index === 0
                    ? [0, 8, 0]
                    : index === 1
                      ? [0, -6, 0]
                      : [0, 10, 0]
                  : 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: "easeOut",
              y: {
                duration: index === 0 ? 1.2 : index === 1 ? 1.0 : 1.1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
              x: {
                duration: index === 0 ? 1.5 : index === 1 ? 1.4 : 1.3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}>
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
          }}>
          <Image src={HomeLogo} alt="start" className={styles.logo} />
        </motion.div>
        <motion.div
          className={styles.mainCharactersContainer}
          initial={{ opacity: 0, y: "10vh" }}
          animate={{
            opacity: animationStage === "complete" ? 1 : 0,
            y: animationStage === "complete" ? 0 : "10vh",
          }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}>
          <MainCharactersBox
            leftImage={<Image src={YutoImage} alt="left" />}
            leftName="YUTO"
            rightImage={<Image src={NatsumiImage} alt="right" />}
            rightName="NATSUMI"
            size="small"
          />
        </motion.div>
      </div>
      <Link
        href={UserPreparePath(props.gameId, props.userId)}
        className={styles.button}>
        <CommonButton color="blue">次へ</CommonButton>
      </Link>
    </div>
  )
}
