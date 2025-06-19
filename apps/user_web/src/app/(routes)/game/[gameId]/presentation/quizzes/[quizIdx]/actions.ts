"use server";
import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function showAnswerAction(gameId: string, quizIdx: number) {
  const db = await getServerDb();
  const gameRef = doc(db, "Games", gameId);

  await updateDoc(gameRef, {
    currentProcess: {
      index: quizIdx,
      type: "answer",
    },
  });

  revalidatePath(`/game/${gameId}/presentation/quizzes/${quizIdx}`);
}

export async function navigateToAnimation(gameId: string, quizIdx: number) {
  const db = await getServerDb();
  const gameRef = doc(db, "Games", gameId);

  // 一面目の場合はアニメーションをスキップして直接次の問題に遷移(チュートリアルとして消費する)
  if (quizIdx === 0) {
    // ゲームデータを取得して質問数を確認
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) {
      throw new Error("Game not found");
    }

    const gameData = gameDoc.data();
    const totalQuestions = gameData.questions?.length || 0;
    const isLastQuestion = quizIdx >= totalQuestions - 1;

    if (isLastQuestion) {
      // 最後の問題の場合はstatusをcompletedにして最終ランキングに遷移
      await updateDoc(gameRef, {
        status: "completed",
      });

      redirect(`/game/${gameId}/presentation/final-ranking`);
    } else {
      // 次の問題に遷移（スコアは更新しない）
      const nextQuizIdx = quizIdx + 1;

      await updateDoc(gameRef, {
        currentProcess: {
          index: nextQuizIdx,
          type: "question",
        },
      });

      redirect(`/game/${gameId}/presentation/quizzes/${nextQuizIdx}`);
    }
  } else {
    // 一面目以外は従来通りアニメーション画面に遷移
    await updateDoc(gameRef, {
      currentProcess: {
        index: quizIdx,
        type: "animation",
      },
    });

    redirect(`/game/${gameId}/presentation/quizzes/${quizIdx}/animation`);
  }
}
