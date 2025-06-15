import { getServerDb } from "@/app/_lib/firebase/server/firestore";
import { Game, Answer, Item } from "@/app/_types";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import CurrentRankingScreen from "./_components/CurrentRankingScreen";

type Props = {
  params: Promise<{
    gameId: string;
    quizIdx: string;
  }>;
};

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

  const itemRef = collection(db, "Items");
  const itemSnap = await getDocs(itemRef);
  const allItems = itemSnap.docs.map((doc) => doc.data() as Item);

  const gameRef = doc(db, "Games", gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) {
    return notFound();
  }
  const game = gameSnap.data() as Game;

  const answersRef = collection(db, "Games", gameId, "Answers");
  const answersSnap = await getDocs(answersRef);
  const allAnswers = answersSnap.docs.map((doc) => doc.data() as Answer);

  if (!game.questions || game.questions.length === 0) {
    return notFound();
  }

  const currentQuestion = game.questions[currentQuizIdx];

  const usersData = game.users.map((gameUser, index) => {
    // Firestoreのgame.usersからscoreを取得
    const prevScore = gameUser?.score || 0;
    let currentScore = prevScore;

    if (currentQuestion) {
      const userAnswer = allAnswers.find(
        (ans) =>
          ans.userId === gameUser.id && ans.questionIndex === currentQuizIdx
      );
      if (
        userAnswer &&
        userAnswer.optionIndex === currentQuestion.correctIndex
      ) {
        currentScore += currentQuestion.point;
      }
    }

    return {
      userId: gameUser.id,
      teamName: gameUser.name,
      thumbnail: gameUser.thumbnail,
      characterImage: `/images/carts/cart_${index + 1}.png`,
      characterColor:
        characterColors.get(index % characterColors.size) || "#FFFFFF",
      prevScore: prevScore,
      currentScore: currentScore,
    };
  });

  const itemEvents = allAnswers
    .filter((ans) => ans.questionIndex === currentQuizIdx && ans.usedItemId)
    .flatMap((answer) => {
      const item = allItems.find((item) => item.itemId === answer.usedItemId);
      if (!item) return [];
      return {
        userId: answer.userId,
        itemId: item.itemId,
        itemName: item.name,
        itemImage: item.image,
        itemMovie: item.movie,
        isCorrectAnswer: answer.optionIndex === currentQuestion.correctIndex,
        effect: item.effect,
      };
    });

  return (
    <CurrentRankingScreen
      gameId={gameId}
      currentQuizIdx={currentQuizIdx}
      users={usersData}
      itemEvents={itemEvents}
    />
  );
}
