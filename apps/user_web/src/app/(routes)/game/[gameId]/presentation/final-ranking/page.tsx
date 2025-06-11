import FinalRankingScreen from "./FinalRankingScreen";

type Props = {
  params: Promise<{
    gameId: string;
  }>
}

export default async function FinalRankingPage({ params }: Props) {
  const { gameId } = await params;
  return <FinalRankingScreen gameId={gameId} />
}