import { documentGet } from "@/app/_lib/firebase/AdminConverter";
import ResultPage from "../../../_pages/ResultPage/ResultPage";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { Game, GameSchema } from "@/app/_types";

type Props = {
  params: {
    gameId: string;
    userId: string;
  };
};

export default async function Page({ params }: Props) {
  const game = await getGame(params.gameId);
  return <ResultPage gameId={params.gameId} game={game} />;
}

async function getGame(gameId: string) {
  initializeAdminSdk();
  const ref = documentGet(GameSchema, "Games", gameId);
  const game = await ref.get();
  return GameSchema.parse(game.data());
}
