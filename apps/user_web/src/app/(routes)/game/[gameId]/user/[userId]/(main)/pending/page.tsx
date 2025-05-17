import { collectionGet, documentGet } from "@/app/_lib/firebase/AdminConverter";
import PendingPage from "@user/_pages/PendingPage/PendingPage";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { Game, GameSchema, Item, ItemSchema } from "@/app/_types";

type Props = {
  params: {
    gameId: string;
    userId: string;
  };
};

export default async function Page(props: Props) {
  const { gameId, userId } = await props.params;
  const items = await getItems(gameId, userId);
  const game = await getGame(gameId);

  if (!game) {
    return <div>ゲームが見つかりません</div>;
  }

  return (
    <PendingPage gameId={gameId} userId={userId} items={items} game={game} />
  );
}

async function getItems(gameId: string, userId: string) {
  initializeAdminSdk();
  const res = await collectionGet(ItemSchema, "Items").get();
  return res.docs.map((doc) => ItemSchema.parse(doc.data()));
}

async function getGame(gameId: string) {
  initializeAdminSdk();
  const res = await documentGet(GameSchema, "Games", gameId).get();
  return GameSchema.parse(res.data());
}
