'use server'
import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { doc, updateDoc } from "firebase/firestore";
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

  await updateDoc(gameRef, {
    currentProcess: {
      index: quizIdx,
      type: "animation",
    },
  });

  redirect(`/game/${gameId}/presentation/quizzes/${quizIdx}/animation`);
}

