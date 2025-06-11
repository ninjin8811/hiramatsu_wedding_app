'use server';
import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { redirect } from "next/navigation";

export async function navigateToQuiz(gameId: string) {
  const db = await getServerDb();
  const gameRef = doc(db, "Games", gameId);

  await updateDoc(gameRef, {
    currentProcess: {
      index: 0,
      type: "question",
    },
    status: "inProgress",
  });

  redirect(`/game/${gameId}/presentation/quizzes/0`);
}




