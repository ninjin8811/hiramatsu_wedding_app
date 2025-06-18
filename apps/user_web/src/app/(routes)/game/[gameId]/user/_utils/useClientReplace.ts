"use client";

import { listenGame } from "@/app/_repositories/game_repository";
import { Game } from "@/app/_types";
import {
  UserHomePath,
  UserQuestionsPath,
  UserResultPath,
} from "@/app/_utils/page_link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useClientReplace(
  gameId: string,
  userId: string,
  keepStatus: Game["status"]
) {
  const { replace } = useRouter();

  useEffect(() => {
    const unsubscribe = listenGame(gameId, (g) => {
      switch (g?.status) {
        case keepStatus:
          break;
        case "created":
          replace(UserHomePath(gameId, userId));
          break;
        case "inProgress":
          replace(UserQuestionsPath(gameId, userId));
          break;
        case "completed":
          replace(UserResultPath(gameId, userId));
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, [gameId, userId, replace, keepStatus]);
}
