import { GameSchema, ItemSchema, UserSchema } from "@/app/_types";
import { documentGet, collectionGet } from "@/app/_lib/firebase/AdminConverter";
import { initializeAdminSdk } from "@/app/_lib/firebase/FirebaseAdminInitializer";

initializeAdminSdk();

export async function getGame(gameId: string) {
  const game = await documentGet(GameSchema, "Games", gameId).get();
  return GameSchema.parse(game.data());
}

export async function getItems() {
  const res = await collectionGet(ItemSchema, "Items").get();
  return res.docs.map((doc) => ItemSchema.parse(doc.data()));
}

export async function getUser(gameId: string, userId: string) {
  const user = await documentGet(
    UserSchema,
    `Games/${gameId}/Users`,
    userId
  ).get();
  return UserSchema.parse(user.data());
}

export async function getTeams(gameId: string) {
  const game = await documentGet(GameSchema, "Games", gameId).get();
  return game.data()?.users ?? [];
}
