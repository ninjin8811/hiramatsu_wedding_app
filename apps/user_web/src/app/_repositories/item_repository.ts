import { onSnapshot } from "firebase/firestore";
import { collectionGet } from "../_lib/firebase/ClientConverter";
import { Item, ItemSchema } from "../_types";
import {
  UserAppItem,
  UserAppItemSchema,
} from "../(routes)/game/[gameId]/user/_utils/userappTypes";

export function listenItems(callback: (items: UserAppItem[]) => void) {
  const ref = collectionGet(UserAppItemSchema, "Items");
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.docs.map((doc) => UserAppItemSchema.parse(doc.data())));
  });
}
