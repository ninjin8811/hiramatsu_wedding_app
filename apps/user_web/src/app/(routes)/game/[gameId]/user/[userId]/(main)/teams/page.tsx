import TeamPage from "../../../_pages/TeamPage/TeamPage";
import { GameSchema } from "@/app/_types";
import { documentGet } from "@/app/_lib/firebase/AdminConverter";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";

type Props = {
  params: {
    gameId: string;
    userId: string;
  };
};

export default async function UserPage(props: Props) {
  const { gameId, userId } = await props.params;
  const teams = await getTeams(gameId);

  return (
    <TeamPage
      userId={userId}
      gameId={gameId}
      team={teams.map((team) => ({
        name: team.name,
        imagePath: team.thumbnail,
      }))}
    />
  );
}

async function getTeams(gameId: string) {
  initializeAdminSdk();
  const game = await documentGet(GameSchema, "games", gameId).get();
  return game.data()?.users ?? [];
}
