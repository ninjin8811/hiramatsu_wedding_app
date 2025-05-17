import { StaticImageData } from "next/image";
import { ReactNode } from "react";
import styles from "./MainCharactersBox.module.scss";

type Props = {
  leftImage: ReactNode;
  leftName: string;
  rightImage: ReactNode;
  rightName: string;
  size: "small" | "large";
};

export default function MainCharactersBox(props: Props) {
  return (
    <div className={`${styles.mainCharactersBox} ${styles[props.size]}`}>
      <div className={`${styles.item} ${styles.left}`}>
        <div className={styles.image}>{props.leftImage}</div>
        <div className={styles.name}>{props.leftName}</div>
      </div>
      <div className={`${styles.item} ${styles.right}`}>
        <div className={styles.image}>{props.rightImage}</div>
        <div className={styles.name}>{props.rightName}</div>
      </div>
    </div>
  );
}
