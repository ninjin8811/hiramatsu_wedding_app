import ResultPage from "../../../_pages/ResultPage/ResultPage";
import { redirect } from "next/navigation";
import { UserResultPath } from "@/app/_utils/page_link";
import { getGame } from "../../../_repositories/server";
import { redirectPathByStatus } from "../../../_utils/redirectPathByStatus";

type Props = {
  params: Promise<{
    gameId: string;
    userId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { gameId, userId } = await params;
  const game = await getGame(gameId);
  const currentPath = UserResultPath(gameId, userId);
  const redirectPath = redirectPathByStatus(game, userId, currentPath);
  if (redirectPath) return redirect(redirectPath);

  return <ResultPage gameId={gameId} game={game} userId={userId} />;
}
