"use client";
import styles from "./ItemGetModal.module.scss";
import ItemGetBackground from "@/app/_images/ItemGetBackground.png";
import ItemGetLogo from "@/app/_images/ItemGetLogo.png";
import Image from "next/image";
import CommonButton from "../CommonButton/CommonButton";
import Link from "next/link";
import { UserPendingPath } from "@/app/_utils/page_link";
import { Item } from "@/app/_types";
import { motion } from "framer-motion";
import { UserAppItem } from "../../_utils/userappTypes";
type Props = {
  gameId: string;
  userId: string;
  items: UserAppItem[];
  onClose: () => void;
};

export default function ItemGetModal(props: Props) {
  return (
    <div className={styles.itemGetModal}>
      {/* 白背景を一瞬で表示 */}
      <motion.div
        className={styles.whiteBackground}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.1,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={styles.background}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.1],
          opacity: [0, 1],
          rotate: 360,
        }}
        transition={{
          scale: {
            duration: 0.2,
            ease: "easeInOut",
            delay: 0.1,
          },
          opacity: {
            duration: 2,
            ease: "easeInOut",
            delay: 0.1,
          },
          rotate: {
            duration: 15,
            ease: "linear",
            repeat: Infinity,
            delay: 0.1,
          },
        }}
      >
        <Image
          className={styles.background}
          src={ItemGetBackground}
          alt="アイテム獲得"
        />
      </motion.div>
      {/* </motion.div> */}
      {/* bounce */}
      <motion.div
        className={styles.main}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{
          scale: [1.2, 1],
          opacity: [0, 1],
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
          delay: 0.3,
        }}
      >
        <Image className={styles.logo} src={ItemGetLogo} alt="アイテム獲得" />

        <div className={styles.content}>
          <div className={styles.content_main}>
            <div className={styles.title}>アイテムゲット！</div>
            <div
              className={`${styles.itemList} ${
                styles[`length_${props.items.length}`]
              }`}
            >
              {props.items.map((item) => (
                <div className={styles.item} key={item.name}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={127}
                    height={120}
                  />
                  <div className={styles.itemName}>{item.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.divider}>
            {Array.from({ length: 100 })
              .fill(null)
              .map((_, index) => (
                <div className={styles.divider_dot} key={index} />
              ))}
          </div>
          <div className={styles.content_foot_title}>
            アイテムを使って
            <br />
            他チームを妨害しよう！
          </div>
        </div>
        <div className={styles.button}>
          <Link
            href={UserPendingPath(props.gameId, props.userId)}
            className={styles.button}
          >
            <CommonButton color="red">つぎへ</CommonButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
