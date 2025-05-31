import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { Game } from "@/app/_types";
import { getDoc, doc } from "firebase/firestore";
import { notFound } from "next/navigation";
import QuizScreen from "./_components/QuizScreen";

type Props = {
  params: Promise<{
    gameId: string;
    // 0-indexed
    quizIdx: string;
  }>
}

export default async function QuizPage({ params }: Props) {
  const { gameId, quizIdx } = await params;
  const db = await getServerDb();
  const game = (await getDoc(doc(db, 'Games', gameId))).data() as Game;
  const mode = game.currentProcess.type === 'animation' ? 'answer' : game.currentProcess.type;
  const currentQuestion = game?.questions[Number(quizIdx)];

  if (!currentQuestion) {
    return notFound();
  }

  const totalQuestionLength = game.questions.length;

  return <QuizScreen gameId={gameId} quizIdx={Number(quizIdx)} mode={mode} totalQuestionLength={totalQuestionLength} currentQuestionIdx={Number(quizIdx)} currentQuestion={currentQuestion} timeLimit={game.answerTime} />
}