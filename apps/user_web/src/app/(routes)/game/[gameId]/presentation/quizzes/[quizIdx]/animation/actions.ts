'use server';
import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { redirect } from "next/navigation";

export async function navigateToNextStep(gameId: string, currentQuizIdx: number) {
  const db = await getServerDb();
  const gameRef = doc(db, "Games", gameId);

  // ゲームデータを取得して質問数を確認
  const gameDoc = await getDoc(gameRef);
  if (!gameDoc.exists()) {
    throw new Error("Game not found");
  }

  const gameData = gameDoc.data();
  const totalQuestions = gameData.questions?.length || 0;
  const isLastQuestion = currentQuizIdx >= totalQuestions - 1;

  if (isLastQuestion) {
    // 最後の問題の場合はstatusをcompletedにして最終ランキングに遷移
    await updateDoc(gameRef, {
      status: "completed",
    });

    redirect(`/game/${gameId}/presentation/final-ranking`);
  } else {
    // 次の問題に遷移
    const nextQuizIdx = currentQuizIdx + 1;

    await updateDoc(gameRef, {
      currentProcess: {
        index: nextQuizIdx,
        type: "question",
      },
    });

    redirect(`/game/${gameId}/presentation/quizzes/${nextQuizIdx}`);
  }
}
