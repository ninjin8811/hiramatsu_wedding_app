"use client";
import ItemDetailModalBaseImage from "@/app/_images/ItemDetailModalBaseImage.png";
import CloseIconBlack from "@/app/_images/CloseIconBlack.png";
import Image from "next/image";
import styles from "./ItemDetailModal.module.scss";
import { ReactNode } from "react";

type Props = {
  image: ReactNode;
  name: string;
  description: string;
  canUse?: boolean;
  onClose: () => void;
};

export default function ItemDetailModal(props: Props) {
  return (
    <div className={styles.itemDetailModal}>
      <div className={styles.content}>
        <Image
          src={CloseIconBlack}
          alt="閉じる"
          className={styles.close}
          onClick={props.onClose}
        />
        <div className={styles.content_image}>{props.image}</div>
        <div className={styles.content_name}>「{props.name}」</div>
        <div className={styles.content_description}>{props.description}</div>
        {props.canUse && (
          <div className={styles.content_button}>
            <div className={`${styles.content_button_item} ${styles.use}`}>
              アイテムを使う
            </div>
            <div
              className={`${styles.content_button_item} ${styles.cancel}`}
              onClick={props.onClose}
            >
              やめておく
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
