import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { Game, Answer, Question } from "@/app/_types";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import CurrentRankingScreen, { User } from "./_components/CurrentRankingScreen";

type Props = {
  params: Promise<{
    gameId: string;
    quizIdx: string;
  }>
}

const characterColors = new Map<number, string>([
  [0, "#FB0025"],
  [1, "#DE6100"],
  [2, "#EDDD00"],
  [3, "#0CD600"],
  [4, "#00A337"],
  [5, "#00D3F4"],
  [6, "#0062D2"],
  [7, "#6F00CA"],
  [8, "#ED009B"],
  [9, "#BD8527"],
  [10, "#705126"],
  [11, "#313131"],
  [12, "#676767"],
  [13, "#CFCFCF"],
  [14, "#B779EC"],
  [15, "#FA7AE6"],
]);

export default async function CurrentRankingPage({ params }: Props) {
  const { gameId, quizIdx: currentQuizIdxStr } = await params;
  const currentQuizIdx = Number(currentQuizIdxStr);
  const db = await getServerDb();

  const gameRef = doc(db, "Games", gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) {
    return notFound();
  }
  const game = gameSnap.data() as Game;

  const answersRef = collection(db, "Games", gameId, "Answers");
  const answersSnap = await getDocs(answersRef);
  const allAnswers = answersSnap.docs.map(doc => doc.data() as Answer);

  const usersRef = collection(db, "Games", gameId, "Users");
  const usersSnap = await getDocs(usersRef);
  const allUsers = usersSnap.docs.map(doc => doc.data() as User);

  if (!game.questions || game.questions.length === 0) {
    return notFound();
  }

  const usersData = allUsers.map((user: User, index: number) => {
    let prevScore = 0;
    let currentScore = 0;

    for (let i = 0; i < currentQuizIdx; i++) {
      const question: Question | undefined = game.questions[i];
      if (!question) continue;
      const userAnswer = allAnswers.find(ans => ans.userId === user.userId && ans.questionIndex === i);
      if (userAnswer && userAnswer.optionIndex === question.correctIndex) {
        prevScore += question.point;
      }
    }

    for (let i = 0; i <= currentQuizIdx; i++) {
      const question: Question | undefined = game.questions[i];
      if (!question) continue;
      const userAnswer = allAnswers.find(ans => ans.userId === user.userId && ans.questionIndex === i);
      if (userAnswer && userAnswer.optionIndex === question.correctIndex) {
        currentScore += question.point;
      }
    }

    return {
      userId: user.userId,
      teamName: user.teamName,
      thumbnail: user.thumbnail,
      characterImage: `/images/carts/cart_${index + 1}.png`,
      characterColor: characterColors.get(index % characterColors.size) || "#FFFFFF",
      prevScore: prevScore,
      currentScore: currentScore,
    };
  });

  return <CurrentRankingScreen gameId={gameId} currentQuizIdx={currentQuizIdx} users={usersData} />
}