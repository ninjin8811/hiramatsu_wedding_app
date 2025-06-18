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
  isUsed?: boolean;
  onUse?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  button?: {
    text: string;
    isDisabled?: boolean;
  };
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
        {props.button && (
          <div className={styles.content_button}>
            <div
              className={`${styles.content_button_item} ${styles.use} ${
                props.button?.isDisabled ? styles.disabled : ""
              }`}
              onClick={() => {
                if (props.button?.isDisabled) return;
                props.onUse?.();
              }}
            >
              {props.button.text}
            </div>
            <div
              className={`${styles.content_button_item} ${styles.cancel}`}
              onClick={() => {
                props.onCancel?.();
                close();
              }}
            >
              {props.isUsed ? "閉じる" : "やめておく"}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
