import StartPage from "@user/_pages/StartPage/StartPage";

type Props = {
  params: {
    gameId: string;
    userId: string;
  };
};

export default async function UserPage(props: Props) {
  const { gameId, userId } = await props.params;
  return <StartPage gameId={gameId} userId={userId} />;
}
