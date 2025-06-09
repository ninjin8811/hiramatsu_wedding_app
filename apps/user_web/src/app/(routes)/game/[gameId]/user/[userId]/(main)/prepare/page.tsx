import { documentGet } from "@/app/_lib/firebase/AdminConverter";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { GameSchema, UserSchema } from "@/app/_types";
import PreparePage from "@user/_pages/PreparePage/PreparePage";
import { getGame, getUser } from "../../../_repositories/server";
import { UserPreparePath } from "@/app/_utils/page_link";
import { redirectPathByStatus } from "../../../_utils/redirectPathByStatus";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    gameId: string;
    userId: string;
  }>;
};

export default async function Page(props: Props) {
  const { gameId, userId } = await props.params;
  const user = await getUser(gameId, userId);
  const game = await getGame(gameId);

  const currentPath = UserPreparePath(gameId, userId);
  const redirectPath = redirectPathByStatus(game, userId, currentPath);
  if (redirectPath) return redirect(redirectPath);

  return (
    <PreparePage gameId={gameId} userId={userId} user={user} game={game} />
  );
}
