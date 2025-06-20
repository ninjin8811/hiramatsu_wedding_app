import { Answer, Game } from "@/app/_types";

/**
 * ユーザーの正答率を計算する（user画面と同じロジック）
 * @param userId - 計算対象のユーザーID
 * @param currentQuizIdx - 現在の問題番号（game.currentProcess.index）
 * @param game - ゲームデータ
 * @param allAnswers - 全ての回答データ
 * @returns 正答率（0-1の範囲）またはnull（最初の問題の回答中）
 */
export function calculateUserCorrectRate(
  userId: string,
  currentQuizIdx: number,
  game: Game,
  allAnswers: Answer[]
): number | null {
  // 最初の問題の回答中は正答率を表示しない
  if (currentQuizIdx === 0 && game.currentProcess.type === "question") {
    return null;
  }

  const finishedLength =
    game.currentProcess.type !== "question"
      ? currentQuizIdx // 結果表示中：現在問題を含む
      : currentQuizIdx - 1; // 問題回答中：現在問題を含まない

  // 対象範囲で回答した問題の正解数を計算
  const correctCount = allAnswers.filter((answer) => {
    return (
      answer.userId === userId &&
      answer.optionIndex ===
        game.questions[answer.questionIndex].correctIndex &&
      answer.questionIndex <= finishedLength - 1
    );
  }).length;

  // 正答率を計算（0-1の範囲）
  return correctCount / finishedLength;
}

/**
 * ボム効果用の正答率計算（nullを返さない版）
 * @param userId - 計算対象のユーザーID
 * @param currentQuizIdx - 現在の問題番号
 * @param game - ゲームデータ
 * @param allAnswers - 全ての回答データ
 * @returns 正答率（0-1の範囲、nullは返さない）
 */
export function calculateUserCorrectRateForBomb(
  userId: string,
  currentQuizIdx: number,
  game: Game,
  allAnswers: Answer[]
): number {
  const rate = calculateUserCorrectRate(
    userId,
    currentQuizIdx,
    game,
    allAnswers
  );
  return rate === null ? 0 : rate;
}
