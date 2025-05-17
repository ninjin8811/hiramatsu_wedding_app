import { collectionGet, documentGet } from "@/app/_lib/firebase/AdminConverter";
import QuestionPage from "../../../_pages/QuestionPage/QuestionPage";
import { GameSchema, ItemSchema } from "@/app/_types";

type Props = {
  params: {
    gameId: string;
    userId: string;
  };
};

export default async function Page(props: Props) {
  const { gameId, userId } = await props.params;
  const game = await getGame(gameId);
  const items = await getItems(gameId);

  return (
    <QuestionPage gameId={gameId} game={game} userId={userId} items={items} />
  );
}

async function getGame(gameId: string) {
  const game = await documentGet(GameSchema, `Games`, gameId).get();
  return GameSchema.parse(game.data());
}

async function getItems(gameId: string) {
  const items = await collectionGet(ItemSchema, `Items`).get();
  return items.docs.map((doc) => ItemSchema.parse(doc.data()));
}
