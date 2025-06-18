import { onSnapshot, query, where } from "firebase/firestore";
import { Answer, AnswerSchema } from "../_types";
import { collectionGet } from "@/app/_lib/firebase/ClientConverter";

export function listenUserAnswers(
  gameId: string,
  userId: string,
  callback: (answers: Answer[]) => void
) {
  const ref = collectionGet(AnswerSchema, `Games/${gameId}/Answers`);
  return onSnapshot(query(ref, where("userId", "==", userId)), (snapshot) => {
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}

export function listenGameAnswers(
  gameId: string,
  callback: (answers: Answer[]) => void
) {
  const ref = collectionGet(AnswerSchema, `Games/${gameId}/Answers`);
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}
