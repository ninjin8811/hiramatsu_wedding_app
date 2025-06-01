import { collectionGet, documentGet } from "@/app/_lib/firebase/AdminConverter";
import PendingPage from "@user/_pages/PendingPage/PendingPage";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { Game, GameSchema, Item, ItemSchema } from "@/app/_types";
import { getGame, getItems } from "../../../_repositories/server";
import { redirectPathByStatus } from "../../../_utils/redirectPathByStatus";
import { UserPendingPath } from "@/app/_utils/page_link";
import { redirect } from "next/navigation";

type Props = {
  params: {
    gameId: string;
    userId: string;
  };
};

export default async function Page(props: Props) {
  const { gameId, userId } = await props.params;
  const items = await getItems();
  const game = await getGame(gameId);

  const currentPath = UserPendingPath(gameId, userId);
  const redirectPath = redirectPathByStatus(game, userId, currentPath);
  if (redirectPath) return redirect(redirectPath);

  if (!game) {
    return <div>ゲームが見つかりません</div>;
  }

  return (
    <PendingPage gameId={gameId} userId={userId} items={items} game={game} />
  );
}
