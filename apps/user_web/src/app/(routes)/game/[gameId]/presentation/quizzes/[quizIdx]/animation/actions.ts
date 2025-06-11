'use server';
import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { GameUser } from "@/app/_types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { redirect } from "next/navigation";

// ユーザーのスコア更新データの型
interface UserScore {
  userId: string;
  score: number;
}

export async function navigateToNextStep(gameId: string, currentQuizIdx: number, usersScores: UserScore[]) {
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

  // ユーザーのスコアを更新
  if (usersScores.length > 0) {
    const currentUsers: GameUser[] = gameData.users || [];
    const updatedUsers = currentUsers.map((user) => {
      const scoreUpdate = usersScores.find(us => us.userId === user.id);
      if (scoreUpdate) {
        return { ...user, score: scoreUpdate.score };
      }
      return user;
    });

    await updateDoc(gameRef, {
      users: updatedUsers,
    });

    console.log('📊 Updated user scores:', usersScores);
  }

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
