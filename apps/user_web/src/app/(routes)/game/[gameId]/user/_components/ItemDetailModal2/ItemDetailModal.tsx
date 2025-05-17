"use client";
import ItemDetailModalBaseImage from "@/app/_images/ItemDetailModalBaseImage.png";
import CloseIcon from "@/app/_images/CloseIcon.png";
import Image from "next/image";
import styles from "./ItemDetailModal.module.scss";
import { ReactNode } from "react";

type Props = {
  image: ReactNode;
  name: string;
  description: string;
  onClose: () => void;
};

export default function ItemDetailModal(props: Props) {
  return (
    <div className={styles.itemDetailModal}>
      <Image
        src={ItemDetailModalBaseImage}
        alt="アイテム詳細モーダル"
        className={styles.base}
      />
      <Image
        src={CloseIcon}
        alt="閉じる"
        className={styles.close}
        onClick={props.onClose}
      />
      <div className={styles.content}>
        <div className={styles.content_image}>{props.image}</div>
        <div className={styles.content_text}>
          <div className={styles.content_text_name}>{props.name}</div>
          <div className={styles.content_text_description}>
            {props.description}
          </div>
        </div>
      </div>
    </div>
  );
}
