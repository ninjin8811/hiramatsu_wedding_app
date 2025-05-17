"use client";
import styles from "./ItemGetModal.module.scss";
import ItemGetBackground from "@/app/_images/ItemGetBackground.png";
import ItemGetLogo from "@/app/_images/ItemGetLogo.png";
import Image from "next/image";
import ItemKiller from "@/app/_images/ItemKiller.png";
import ItemAkakora from "@/app/_images/ItemAkakora.png";
import CloseIconBlack from "@/app/_images/CloseIconBlack.png";
import CommonButton from "../CommonButton/CommonButton";
import Link from "next/link";
import { UserPendingPath } from "@/app/_utils/page_link";

type Props = {
  gameId: string;
  userId: string;
  onClose: () => void;
};

export default function ItemGetModal(props: Props) {
  const items = [
    {
      image: <Image src={ItemAkakora} alt="アカカロ" />,
      name: "アカこうら",
    },
    {
      image: <Image src={ItemKiller} alt="キラー" />,
      name: "キラー",
    },
  ];

  return (
    <div className={styles.itemGetModal}>
      <Image
        src={CloseIconBlack}
        alt="閉じる"
        className={styles.close}
        onClick={props.onClose}
      />
      <Image
        className={styles.background}
        src={ItemGetBackground}
        alt="アイテム獲得"
      />
      <Image className={styles.logo} src={ItemGetLogo} alt="アイテム獲得" />
      <div className={styles.content}>
        <div className={styles.content_main}>
          <div className={styles.title}>アイテムゲット！</div>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div className={styles.item} key={item.name}>
                {item.image}
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
    </div>
  );
}
