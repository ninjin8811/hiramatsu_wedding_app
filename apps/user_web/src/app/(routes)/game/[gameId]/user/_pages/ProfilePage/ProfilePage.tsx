"use client";
import Image from "next/image";
import styles from "./ProfilePage.module.scss";
import UserMainItemBox from "@/app/_images/UserMainItemBox.png";
import SampleTeamImage from "@/app/_images/SampleTeamImage.png";
import MarioCap from "@/app/_images/MarioCap.png";
import CommonButton from "../../_components/CommonButton/CommonButton";
import { ReactNode, useEffect, useState } from "react";
import ItemGetModal from "../../_components/ItemGetModal/ItemGetModal";
import ProfileBox from "../../_components/ProfileBox/ProfileBox";
import ItemAkakora from "@/app/_images/ItemAkakora.png";
import ItemDetailModal from "../../_components/ItemDetailModal/ItemDetailModal";

export default function ProfilePage() {
  const [showItemGetModal, setShowItemGetModal] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [items, setItems] = useState<
    {
      image: ReactNode;
      name: string;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    setItems([
      {
        image: <Image src={ItemAkakora} alt="アカこうら" />,
        name: "アカこうら",
        description: "アカこうらはアイテムです。",
      },
    ]);
  }, []);

  return (
    <div className={styles.profilePage}>
      <div className={styles.content}>
        <div className={styles.profileBox}>
          <ProfileBox title="プロフィール">
            <div className={styles.profile}>
              <Image src={MarioCap} alt="キャップ" className={styles.cap} />
              <Image
                src={SampleTeamImage}
                alt="プロフィール"
                className={styles.thumbnail}
              />
              親族チーム
            </div>
          </ProfileBox>
        </div>
        <div className={styles.item}>
          <ProfileBox title="アイテムをゲット">
            <div className={styles.itemSelect}>
              <Image
                src={UserMainItemBox}
                alt="アイテムをゲット"
                onClick={() => setShowItemGetModal(true)}
              />
              タップしてアイテムをゲット
            </div>
          </ProfileBox>
        </div>
        {/* <ProfileBox title="手持ちアイテム">
          <div className={styles.itemList}>
            <div className={styles.itemList_item}>
              <Image src={ItemAkakora} alt="アカこうら" />
              アカこうら
            </div>
            <div className={styles.itemList_item}>
              <Image src={ItemAkakora} alt="アカこうら" />
              アカこうら
            </div>
            <div
              className={styles.itemList_item}
              onClick={() => setShowItemDetailModal(true)}
            >
              <Image src={ItemAkakora} alt="アカこうら" />
              アカこうら
            </div>
          </div>
        </ProfileBox> */}
      </div>
      <div className={styles.button}>
        <CommonButton color="red">つぎへ</CommonButton>
      </div>
      {showItemGetModal && <ItemGetModal />}
      {showItemDetailModal && (
        <ItemDetailModal
          image={<Image src={ItemAkakora} alt="アカこうら" />}
          name="アカこうら"
          description="アカこうらはアイテムです。"
          onClose={() => setShowItemDetailModal(false)}
        />
      )}

      <ItemDetailModal
        image={<Image src={ItemAkakora} alt="アカこうら" />}
        name="アカこうら"
        description="アカこうらはアイテムです。アカこうらはアイテムです。アカこうらはアイテムです。"
        onClose={() => setShowItemDetailModal(false)}
      />
    </div>
  );
}
