import { documentGet } from "@/app/_lib/firebase/AdminConverter";
import { UserSchema } from "@/app/_types";
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

  return <PreparePage gameId={gameId} userId={userId} user={user} />;
}

async function getUser(gameId: string, userId: string) {
  const user = await documentGet(
    UserSchema,
    `Games/${gameId}/Users`,
    userId
  ).get();
  return UserSchema.parse(user.data());
}
