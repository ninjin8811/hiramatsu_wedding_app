import { GameSchema, ItemSchema, UserSchema } from "@/app/_types";
import { documentGet, collectionGet } from "@/app/_lib/firebase/AdminConverter";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";
import { unstable_cache } from "next/cache";

initializeAdminSdk();

export async function getGame(gameId: string) {
  const game = await documentGet(GameSchema, "Games", gameId).get();
  return GameSchema.parse(game.data());
}

export async function getItems() {
  const request = unstable_cache(
    async () => {
      const res = await collectionGet(ItemSchema, "Items").get();
      return res.docs.map((doc) => ItemSchema.parse(doc.data()));
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
    async () => {
      const user = await documentGet(
        UserSchema,
        `Games/${gameId}/Users`,
        userId
      ).get();
      return UserSchema.parse(user.data());
    },
    ["user"],
    {
      revalidate: 60,
    }
  );
  return request();
}
export async function getTeams(gameId: string) {
  const game = await documentGet(GameSchema, "Games", gameId).get();
  return game.data()?.users ?? [];
}
