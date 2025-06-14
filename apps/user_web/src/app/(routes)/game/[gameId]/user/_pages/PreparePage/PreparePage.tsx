"use client";
import Image from "next/image";
import styles from "./PreparePage.module.scss";
import UserMainItemBox from "@/app/_images/UserMainItemBox.png";
import { useState } from "react";
import ItemGetModal from "../../_components/ItemGetModal/ItemGetModal";
import PrepareBox from "../../_components/PrepareBox/PrepareBox";
import { Game, Item, GameUser } from "@/app/_types";
import CapImage from "../../_components/CapImage/CapImage";

type Props = {
  gameId: string;
  userId: string;
  user: GameUser;
  game: Game;
  items: Item[];
};

export default function PreparePage(props: Props) {
  const [showItemGetModal, setShowItemGetModal] = useState(false);

  const userIndex = props.game.users.findIndex(
    (summary) => summary.id === props.userId
  );

  const ownItems = props.game.users[userIndex].itemIds
    .map((itemId) => props.items.find((item) => item.itemId === itemId))
    .filter((item) => item !== undefined);

  return (
    <div className={styles.preparePage}>
      <div className={styles.content}>
        <div className={styles.prepareBox}>
          <PrepareBox title="プロフィール">
            <div className={styles.profile}>
              <CapImage index={userIndex} className={styles.cap} />
              <Image
                src={props.user.thumbnail}
                alt="プロフィール"
                width={111}
                height={111}
                className={styles.thumbnail}
              />
              {props.user.name}
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
          items={ownItems}
        />
      )}
    </div>
  );
}
