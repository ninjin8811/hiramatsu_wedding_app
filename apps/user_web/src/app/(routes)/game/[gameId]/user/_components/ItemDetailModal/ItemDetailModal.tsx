"use client";
import ItemDetailModalBaseImage from "@/app/_images/ItemDetailModalBaseImage.png";
import CloseIconBlack from "@/app/_images/CloseIconBlack.png";
import Image from "next/image";
import styles from "./ItemDetailModal.module.scss";
import { ReactNode, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  image: ReactNode;
  name: string;
  description: string;
  canUse?: boolean;
  isUsed?: boolean;
  onUse?: () => void;
  onClose: () => void;
};

export default function ItemDetailModal(props: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const close = () => {
    setIsClosing(true);
    setTimeout(() => {
      props.onClose();
    }, 200);
  };
  return (
    <motion.div
      className={styles.itemDetailModal}
      animate={{
        opacity: isClosing ? [1, 0] : [0, 1],
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      onClick={close}
    >
      <motion.div
        className={styles.content}
        animate={{
          scale: isClosing ? [1, 0] : [0, 1],
          opacity: isClosing ? [1, 0] : [0, 1],
        }}
        transition={{
          duration: isClosing ? 0.1 : 0.2,
          ease: "easeInOut",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Image
          src={CloseIconBlack}
          alt="閉じる"
          className={styles.close}
          onClick={close}
        />
        <div className={styles.content_image}>{props.image}</div>
        <div className={styles.content_name}>「{props.name}」</div>
        <div className={styles.content_description}>{props.description}</div>
        {props.canUse && (
          <div className={styles.content_button}>
            <div
              className={`${styles.content_button_item} ${styles.use} ${
                props.isUsed ? styles.used : ""
              }`}
              onClick={() => {
                if (props.isUsed) return;
                props.onUse?.();
              }}
            >
              {props.isUsed ? "使用済み " : "アイテムを使う"}
            </div>
            <div
              className={`${styles.content_button_item} ${styles.cancel}`}
              onClick={props.onClose}
            >
              {props.isUsed ? "閉じる" : "やめておく"}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
