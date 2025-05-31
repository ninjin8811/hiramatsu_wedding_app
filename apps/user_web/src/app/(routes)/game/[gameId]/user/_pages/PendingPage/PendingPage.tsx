"use client";
import Image from "next/image";
import styles from "./PendingPage.module.scss";
import SampleTeamImage from "@/app/_images/SampleTeamImage.png";
import MarioCap from "@/app/_images/MarioCap.png";
import { ReactNode, useEffect, useState } from "react";
import ItemAkakora from "@/app/_images/ItemAkakora.png";
import ItemDetailModal from "@user/_components/ItemDetailModal/ItemDetailModal";
import PrepareBox from "@user/_components/PrepareBox/PrepareBox";
import { Game, GameSchema, Item } from "@/app/_types";
import StorageImage from "../../_components/StorageImage/StorageImage";
import { documentGet } from "@/app/_lib/firebase/ClientConverter";
import { onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { UserQuestionsPath } from "@/app/_utils/page_link";
import CapImage from "../../_components/CapImage/CapImage";

type Props = {
  gameId: string;
  userId: string;
  items: Item[];
  game: Game;
};

export default function PendingPage(props: Props) {
  const [game, setGame] = useState<Game>(props.game);
  const userSummary = props.game.users.find(
    (summary) => summary.id === props.userId
  );

  const userIndex = props.game.users.findIndex(
    (summary) => summary.id === props.userId
  );

  const ownItems = props.items.filter((item) =>
    userSummary?.itemIds.includes(item.itemId)
  );

  const { replace } = useRouter();

  useEffect(() => {
    if (game.status === "inProgress") {
      replace(UserQuestionsPath(props.gameId, props.userId));
    }
  }, [game]);

  useEffect(() => {
    const ref = documentGet(GameSchema, `Games`, props.gameId);
    onSnapshot(ref, (snapshot) => {
      const game = snapshot.data() as Game;
      setGame(game);
    });
  }, []);

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
              {ownItems.map((item) => (
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
              {/* <ItemButton
                image={<Image src={ItemAkakora} alt="アカこうら" />}
                name="アカこうら"
                description="アカこうらはアイテムです。"
              />
              <ItemButton
                image={<Image src={ItemAkakora} alt="アカこうら" />}
                name="アカこうら"
                description="アカこうらはアイテムです。"
              />
              <ItemButton
                image={<Image src={ItemAkakora} alt="アカこうら" />}
                name="アカこうら"
                description="アカこうらはアイテムです。"
              /> */}
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
