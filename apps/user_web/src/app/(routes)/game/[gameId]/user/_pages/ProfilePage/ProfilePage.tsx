"use client";
import Image from "next/image";
import styles from "./ProfilePage.module.scss";
import UserMainItemBox from "@/app/_images/UserMainItemBox.png";
import SampleTeamImage from "@/app/_images/SampleTeamImage.png";
import MarioCap from "@/app/_images/MarioCap.png";
import CommonButton from "../../_components/CommonButton/CommonButton";
import { useState } from "react";
import ItemGetModal from "../../_components/ItemGetModal/ItemGetModal";

export default function ProfilePage() {
  const [showItemGetModal, setShowItemGetModal] = useState(false);
  return (
    <div className={styles.profilePage}>
      <div className={styles.content}>
        <div className={styles.profileBox}>
          <BoxItem title="プロフィール">
            <div className={styles.profile}>
              <Image src={MarioCap} alt="キャップ" className={styles.cap} />
              <Image
                src={SampleTeamImage}
                alt="プロフィール"
                className={styles.thumbnail}
              />
              親族チーム
            </div>
          </BoxItem>
        </div>
        <div className={styles.item}>
          <BoxItem title="アイテムをゲット">
            <div className={styles.itemSelect}>
              <Image
                src={UserMainItemBox}
                alt="アイテムをゲット"
                onClick={() => setShowItemGetModal(true)}
              />
              タップしてアイテムをゲット
            </div>
          </BoxItem>
        </div>
      </div>
      <div className={styles.button}>
        <CommonButton color="red">つぎへ</CommonButton>
      </div>
      {showItemGetModal && <ItemGetModal />}
    </div>
  );
}

type BoxItemProps = {
  title: string;
  children: React.ReactNode;
};

function BoxItem(props: BoxItemProps) {
  return (
    <div className={styles.boxItem}>
      <div className={styles.boxItem_title}>{props.title}</div>
      <div className={styles.boxItem_content}>{props.children}</div>
    </div>
  );
}
