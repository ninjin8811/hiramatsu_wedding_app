import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { Game } from "@/app/_types";
import { getDoc, doc } from "firebase/firestore";
import { notFound } from "next/navigation";
import CurrentRankingScreen from "./_components/CurrentRankingScreen";

type Props = {
  params: Promise<{
    gameId: string;
    quizIdx: string;
  }>
}

export default async function CurrentRankingPage({ params }: Props) {
  const { gameId, quizIdx } = await params;
  const db = await getServerDb();
  const game = (await getDoc(doc(db, 'Games', gameId))).data() as Game;
  const currentQuestion = game?.questions[Number(quizIdx)];

  if (!currentQuestion) {
    return notFound();
  }

  const totalQuestionLength = game.questions.length;
  const nextQuestionIdx = Number(quizIdx) + 1;
  const nextPath = nextQuestionIdx < totalQuestionLength ? `/game/${gameId}/presentation/quizzes/${nextQuestionIdx}` : `/game/${gameId}/presentation/finalRanking`;

  return <CurrentRankingScreen currentQuestionIdx={Number(quizIdx)} nextPath={nextPath} />
}