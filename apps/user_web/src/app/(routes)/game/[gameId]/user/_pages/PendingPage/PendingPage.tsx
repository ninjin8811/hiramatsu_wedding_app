"use client";
import styles from "./PendingPage.module.scss";
import { ReactNode, useState } from "react";
import ItemDetailModal from "@user/_components/ItemDetailModal/ItemDetailModal";
import PrepareBox from "@user/_components/PrepareBox/PrepareBox";
import { Game } from "@/app/_types";
import StorageImage from "../../_components/StorageImage/StorageImage";
import CapImage from "../../_components/CapImage/CapImage";
import { useClientReplace } from "../../_utils/useClientReplace";
import { UserAppItem } from "../../_utils/userappTypes";

type Props = {
  gameId: string;
  userId: string;
  items: UserAppItem[];
  game: Game;
};

export default function PendingPage(props: Props) {
  const userSummary = props.game.users.find(
    (summary) => summary.id === props.userId
  );

  const userIndex = props.game.users.findIndex(
    (summary) => summary.id === props.userId
  );

  const ownItems = userSummary?.itemIds
    .map((itemId) => props.items.find((item) => item.itemId === itemId))
    .filter((item) => item !== undefined);

  useClientReplace(props.gameId, props.userId, "created");

  return (
    <div className={styles.pendingPage}>
      <div className={styles.content}>
        <div className={styles.prepareBox}>
          <PrepareBox title="プロフィール">
            <div className={styles.profile}>
              <CapImage index={userIndex} className={styles.cap} />
              {userSummary?.thumbnail ? (
                <StorageImage
                  path={userSummary.thumbnail}
                  alt="プロフィール"
                  className={styles.thumbnail}
                  width={111}
                  height={111}
                />
              ) : (
                <div className={styles.thumbnail} />
              )}
              {userSummary?.name}
            </div>
          </PrepareBox>
        </div>
        <div className={styles.item}>
          <PrepareBox title="手持ちアイテム">
            <div className={styles.itemList}>
              {ownItems?.map((item) => (
                <ItemButton
                  key={item.itemId}
                  image={
                    <StorageImage
                      path={item.image}
                      alt={item.name}
                      width={60}
                      height={55}
                    />
                  }
                  name={item.name}
                  description={item.description}
                />
              ))}
            </div>
          </PrepareBox>
        </div>
      </div>
      <div className={styles.message}>ゲーム開始までお待ちください...</div>
    </div>
  );
}

function ItemButton(props: {
  image: ReactNode;
  name: string;
  description: string;
}) {
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  return (
    <>
      <div
        className={styles.itemButton}
        onClick={() => setShowItemDetailModal(true)}
      >
        <div className={styles.itemButton_image}>{props.image}</div>
        <div className={styles.itemButton_name}>{props.name}</div>
        {/* <div className={styles.itemButton_description}>{props.description}</div> */}
      </div>
      {showItemDetailModal && (
        <ItemDetailModal
          image={props.image}
          name={props.name}
          description={props.description}
          onClose={() => setShowItemDetailModal(false)}
        />
      )}
    </>
  );
}
