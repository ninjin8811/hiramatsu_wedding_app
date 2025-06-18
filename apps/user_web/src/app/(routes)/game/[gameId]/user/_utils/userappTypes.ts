import { Item, ItemSchema } from "@/app/_types";
import { z } from "zod";

// ItemSchemaの一部を取り出したもの

export const UserAppItemSchema = ItemSchema.pick({
  itemId: true,
  name: true,
  description: true,
  image: true,
});

export type UserAppItem = z.infer<typeof UserAppItemSchema>;
