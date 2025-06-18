import { GameSchema, ItemSchema, UserSchema } from "@/app/_types";
import { documentGet, collectionGet } from "@/app/_lib/firebase/AdminConverter";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { unstable_cache } from "next/cache";
import { UserAppItemSchema } from "../_utils/userappTypes";

initializeAdminSdk();

export async function getGame(gameId: string) {
  const game = await documentGet(GameSchema, "Games", gameId).get();
  return GameSchema.parse(game.data());
}

export async function getItems() {
  const request = unstable_cache(
    async () => {
      const res = await collectionGet(UserAppItemSchema, "Items").get();
      return res.docs.map((doc) => UserAppItemSchema.parse(doc.data()));
    },
    ["items"],
    {
      revalidate: 60,
    }
  );
  return request();
}

export async function getUser(gameId: string, userId: string) {
  const request = unstable_cache(
    async (gameId: string, userId: string) => {
      const user = await documentGet(
        UserSchema,
        `Games/${gameId}/Users`,
        userId
      ).get();
      return UserSchema.parse(user.data());
    },
    ["user", gameId, userId],
    {
      revalidate: 60,
    }
  );
  return request(gameId, userId);
}
export async function getTeams(gameId: string) {
  const game = await documentGet(GameSchema, "Games", gameId).get();
  return game.data()?.users ?? [];
}
