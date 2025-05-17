import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { Game } from "@/app/_types";
import { getDoc, doc } from "firebase/firestore";
import { notFound } from "next/navigation";
import QuizScreen from "./_components/QuizScreen";

type Props = {
  params: Promise<{
    gameId: string;
    quizIdx: string;
  }>
}

export default async function QuizPage({ params }: Props) {
  const { gameId, quizIdx } = await params;
  const db = await getServerDb();
  const game = (await getDoc(doc(db, 'Games', gameId))).data() as Game;
  const currentQuestion = game?.questions[Number(quizIdx)];

  if (!currentQuestion) {
    return notFound();
  }

  const totalQuestionLength = game.questions.length;
  const nextQuestionIdx = Number(quizIdx) + 1;
  const nextPath = nextQuestionIdx < totalQuestionLength ? `/game/${gameId}/presentation/quizzes/${nextQuestionIdx}` : `/game/${gameId}/presentation/ranking`;

  return <QuizScreen totalQuestionLength={totalQuestionLength} currentQuestionIdx={Number(quizIdx)} currentQuestion={currentQuestion} timeLimit={game.answerTime} nextPath={nextPath} />
}