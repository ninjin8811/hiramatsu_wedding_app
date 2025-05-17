import { onSnapshot } from "firebase/firestore";
import { Game, GameSchema } from "../_types";
import { documentGet, GetAppModelType } from "../_lib/firebase/ClientConverter";

export const listenGame = (
  gameId: string,
  callback: (data: GetAppModelType<Game> | null) => void
) => {
  const gameRef = documentGet(GameSchema, "games", gameId);

  onSnapshot(gameRef, (snapshot) => {
    const data = snapshot.data();
    if (data) {
      callback(data);
    } else {
      callback(null);
    }
  });
};
