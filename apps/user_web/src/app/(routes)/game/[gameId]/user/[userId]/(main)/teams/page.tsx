import TeamPage from "../../../_pages/TeamPage/TeamPage";
import { GameSchema } from "@/app/_types";
import { documentGet } from "@/app/_lib/firebase/AdminConverter";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { getGame, getTeams } from "../../../_repositories/server";
import { UserTeamsPath } from "@/app/_utils/page_link";
import { redirectPathByStatus } from "../../../_utils/redirectPathByStatus";
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
