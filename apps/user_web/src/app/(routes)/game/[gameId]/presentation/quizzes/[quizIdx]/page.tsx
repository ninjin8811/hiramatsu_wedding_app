import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { Game, Answer } from "@/app/_types";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import QuizScreen from "./_components/QuizScreen";

type Props = {
  params: Promise<{
    gameId: string;
    // 0-indexed
    quizIdx: string;
  }>;
};

export default async function QuizPage({ params }: Props) {
  const { gameId, quizIdx } = await params;
  const db = await getServerDb();

  // ゲームデータを取得
  const game = (await getDoc(doc(db, "Games", gameId))).data() as Game;
  const mode =
    game.currentProcess.type === "animation"
      ? "answer"
      : game.currentProcess.type;
  const currentQuestion = game?.questions[Number(quizIdx)];

  if (!currentQuestion) {
    return notFound();
  }

  // 回答データを取得してプレーンオブジェクトに変換
  const answersSnapshot = await getDocs(
    collection(db, "Games", gameId, "Answers")
  );
  const answers: Answer[] = answersSnapshot.docs.map((doc) => {
    const data = doc.data();
    // Firebase Timestampなどの複雑なオブジェクトを削除して、必要なフィールドのみ抽出
    return {
      answerId: data.answerId,
      questionIndex: data.questionIndex,
      userId: data.userId,
      optionIndex: data.optionIndex,
      usedItemId: data.usedItemId,
    } as Answer;
  });

  const totalQuestionLength = game.questions.length;

  return (
    <QuizScreen
      gameId={gameId}
      quizIdx={Number(quizIdx)}
      mode={mode}
      totalQuestionLength={totalQuestionLength}
      currentQuestionIdx={Number(quizIdx)}
      currentQuestion={currentQuestion}
      timeLimit={game.answerTime}
      gameUsers={game.users}
      answers={answers}
    />
  );
}
