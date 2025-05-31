import { documentGet } from "@/app/_lib/firebase/AdminConverter";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { GameSchema, UserSchema } from "@/app/_types";
import PreparePage from "@user/_pages/PreparePage/PreparePage";

type Props = {
  params: {
    gameId: string;
    userId: string;
  };
};

export default async function Page(props: Props) {
  const { gameId, userId } = await props.params;
  const user = await getUser(gameId, userId);
  const game = await getGame(gameId);

  return (
    <PreparePage gameId={gameId} userId={userId} user={user} game={game} />
  );
}

async function getUser(gameId: string, userId: string) {
  initializeAdminSdk();
  const user = await documentGet(
    UserSchema,
    `Games/${gameId}/Users`,
    userId
  ).get();
  return UserSchema.parse(user.data());
}

async function getGame(gameId: string) {
  initializeAdminSdk();
  const game = await documentGet(GameSchema, `Games`, gameId).get();
  return GameSchema.parse(game.data());
}
