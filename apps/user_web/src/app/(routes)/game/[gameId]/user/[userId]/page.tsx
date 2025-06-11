import { UserHomePath } from "@/app/_utils/page_link";
import StartPage from "@user/_pages/StartPage/StartPage";
import { redirectPathByStatus } from "../_utils/redirectPathByStatus";
import { getGame } from "../_repositories/server";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    gameId: string;
    userId: string;
  }>;
};

export default async function UserPage(props: Props) {
  const { gameId, userId } = await props.params;
  const game = await getGame(gameId);

  const currentPath = UserHomePath(gameId, userId);
  const redirectPath = redirectPathByStatus(game, userId, currentPath);
  if (redirectPath) return redirect(redirectPath);

  return <StartPage gameId={gameId} userId={userId} />;
}
