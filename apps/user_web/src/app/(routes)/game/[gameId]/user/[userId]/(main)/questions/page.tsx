import QuestionPage from "../../../_pages/QuestionPage/QuestionPage";
import { getGame, getItems } from "../../../_repositories/server";
import { UserQuestionsPath } from "@/app/_utils/page_link";
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
  const game = await getGame(gameId);
  const items = await getItems();

  const currentPath = UserQuestionsPath(gameId, userId);
  const redirectPath = redirectPathByStatus(game, userId, currentPath);
  if (redirectPath) return redirect(redirectPath);

  return (
    <QuestionPage gameId={gameId} game={game} userId={userId} items={items} />
  );
}
