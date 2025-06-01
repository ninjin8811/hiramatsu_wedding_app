import { Game } from "@/app/_types";
import {
  UserHomePath,
  UserQuestionsPath,
  UserResultPath,
} from "@/app/_utils/page_link";

export function redirectPathByStatus(
  game: Game,
  userId: string,
  currentPath: string
) {
  switch (game.status) {
    case "created":
      if (currentPath.endsWith("prepare")) return null;
      if (currentPath.endsWith("pending")) return null;
      if (currentPath == UserQuestionsPath(game.gameId, userId)) return null;
      return UserHomePath(game.gameId, userId);
    case "inProgress":
      if (currentPath == UserQuestionsPath(game.gameId, userId)) return null;
      return UserQuestionsPath(game.gameId, userId);
    case "completed":
      if (currentPath == UserResultPath(game.gameId, userId)) return null;
      return UserResultPath(game.gameId, userId);
  }
}
