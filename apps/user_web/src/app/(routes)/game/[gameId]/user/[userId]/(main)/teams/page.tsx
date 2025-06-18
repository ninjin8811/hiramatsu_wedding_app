import TeamPage from "../../../_pages/TeamPage/TeamPage";
import { getGame } from "../../../_repositories/server";

type Props = {
  params: Promise<{
    gameId: string;
    userId: string;
  }>;
};

// チーム一覧ページ. ユーザー側表示はなくす (再利用されるかもなので残してます)
export default async function Page(props: Props) {
  const { gameId, userId } = await props.params;
  const game = await getGame(gameId);

  const teams = game.users ?? [];
  return (
    <TeamPage
      userId={userId}
      gameId={gameId}
      teams={teams.map((team) => ({
        name: team.name,
        imagePath: team.thumbnail,
      }))}
    />
  );
}
