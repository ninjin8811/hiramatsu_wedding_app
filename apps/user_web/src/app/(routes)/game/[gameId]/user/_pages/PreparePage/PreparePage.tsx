"use client";
import Image from "next/image";
import styles from "./PreparePage.module.scss";
import UserMainItemBox from "@/app/_images/UserMainItemBox.png";
import MarioCap from "@/app/_images/MarioCap.png";
import { useState } from "react";
import ItemGetModal from "../../_components/ItemGetModal/ItemGetModal";
import PrepareBox from "../../_components/PrepareBox/PrepareBox";
import { User } from "@/app/_types";

type Props = {
  gameId: string;
  userId: string;
  user: User;
};

export default function PreparePage(props: Props) {
  const [showItemGetModal, setShowItemGetModal] = useState(false);

  return (
    <div className={styles.preparePage}>
      <div className={styles.content}>
        <div className={styles.prepareBox}>
          <PrepareBox title="プロフィール">
            <div className={styles.profile}>
              <Image src={MarioCap} alt="キャップ" className={styles.cap} />
              <Image
                src={props.user.thumbnail}
                alt="プロフィール"
                width={111}
                height={111}
                className={styles.thumbnail}
              />
              親族チーム
            </div>
          </PrepareBox>
        </div>
        <div className={styles.item}>
          <PrepareBox title="アイテムをゲット">
            <div className={styles.itemSelect}>
              <Image
                src={UserMainItemBox}
                alt="アイテムをゲット"
                onClick={() => setShowItemGetModal(true)}
              />
              タップしてアイテムをゲット
            </div>
          </PrepareBox>
        </div>
      </div>
      {showItemGetModal && (
        <ItemGetModal
          onClose={() => setShowItemGetModal(false)}
          gameId={props.gameId}
          userId={props.userId}
        />
      )}
    </div>
  );
}
