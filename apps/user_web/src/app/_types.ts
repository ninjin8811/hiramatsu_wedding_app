import { z } from "zod";

/**
 * fyi: スプレッドシートの叩き
 * https://docs.google.com/spreadsheets/d/1PibrmI3aes0JWmU-UJNl3jNfdMrprzn8bBw6st-NWkM/edit?gid=830245941#gid=830245941
 */

// [Game]/{gameId}/questions/ （質問オブジェクト）
export const QuestionSchema = z.object({
  question: z.string().describe("質問文"),
  options: z.array(z.string()).describe("回答選択肢の配列"),
  correctIndex: z
    .number()
    .int()
    .nonnegative()
    .describe("正解の選択肢インデックス"),
  imagePath: z
    .string()
    .url()
    .describe("質問に関連する画像パス (Firebase Storage URL)"),
  point: z.number().int().nonnegative().describe("正解時に獲得するポイント"),
});

// [Game]/{gameId}/[User]/{userId} （一般ユーザーデータ）
export const UserSchema = z.object({
  userId: z.string().describe("ユーザーID"),
  name: z.string().describe("ユーザー名(今回だとチーム名)"),
  thumbnail: z
    .string()
    .url()
    .describe("チームサムネイル画像URL (Firebase Storage JPG)"),
});

// [Game]/{gameId}/[Answer]/{answerId}
export const AnswerSchema = z.object({
  answerId: z.string().describe("回答ID"),
  questionIndex: z
    .number()
    .int()
    .nonnegative()
    .describe("対象の質問インデックス"),
  userId: z.string().describe("回答したユーザーのID"),
  optionIndex: z
    .number()
    .int()
    .nonnegative()
    .describe("Option(選択した回答)のインデックス"),
  usedItemId: z
    .string()
    .nullable()
    .describe("使用したアイテムID（未使用の場合はnull）"),
});

// [Game]/{gameId}/users/（ゲーム参加者）
export const GameUserSchema = z.object({
  id: z.string().describe("ユーザーID"),
  name: z.string().describe("ユーザー名（チーム名など）"),
  thumbnail: z
    .string()
    .url()
    .describe("ユーザーサムネイル画像URL (Firebase Storage JPG)"),
  smileThumbnail: z
    .string()
    .url()
    .describe("チームサムネイル画像URL (Firebase Storage JPG)"),
  sadThumbnail: z
    .string()
    .url()
    .describe("チームサムネイル画像URL (Firebase Storage JPG)"),
  itemIds: z.array(z.string()).describe("所持しているアイテムIDの配列"),
  score: z.number().int().nonnegative().describe("現在のスコア"),
});

// [Game]/{gameId}/currentProcess/ （現在の進行状態）
export const CurrentProcessSchema = z.object({
  index: z
    .number()
    .int()
    .nonnegative()
    .describe("現在の質問または処理のインデックス"),
  type: z.enum(["question", "answer", "animation"]).describe("現在の進行種別"),
});

// [Game]/{gameId}
export const GameSchema = z.object({
  gameId: z.string().describe("ゲームID"),
  name: z.string().describe("ゲーム名（例: 結婚式ゲーム）"),
  questions: z.array(QuestionSchema).describe("ゲーム内の質問リスト"),
  status: z
    .enum(["created", "inProgress", "completed"])
    .describe("ゲームステータス"),
  answerTime: z
    .number()
    .int()
    .positive()
    .describe("各質問の回答制限時間（秒）"),
  users: z.array(GameUserSchema).describe("参加ユーザーのゲーム内情報の配列"),
  Users: z.array(UserSchema).describe("参加ユーザーのメタデータ配列"),
  currentProcess: CurrentProcessSchema.describe("現在のゲーム進行状況"),
});

// アイテムエフェクトのターゲット指定方法
export const EffectTargetTypeSchema = z
  .enum(["rank_position", "specific_user", "all_users", "random_users"])
  .describe("エフェクトのターゲット指定方法");

// 単一のエフェクト定義
export const ItemEffectSchema = z.object({
  targetType:
    EffectTargetTypeSchema.optional().describe(
      "エフェクトのターゲット指定方法"
    ),
  targetValue: z
    .union([z.number(), z.string()])
    .optional()
    .describe(
      "rank_position: 順位(1-based), specific_user: userId, random_users: 対象数"
    ),
  scoreChange: z
    .number()
    .optional()
    .describe("スコア変動量（負の値で減点、正の値で加点）"),
  effectType: z
    .enum(["score_change", "copy_rank_score", "conditional_bonus"])
    .optional()
    .describe("エフェクトの種類"),
  copyFromRank: z
    .number()
    .optional()
    .describe("copy_rank_score用: コピー元の順位(1-based)"),
  condition: z
    .enum(["correct_answer"])
    .optional()
    .describe("conditional_bonus用: 効果発動条件"),
  topRanksOnly: z
    .number()
    .optional()
    .describe("上位N位のみを対象にする場合のN"),
});

// [Item]/{itemId}
export const ItemSchema = z.object({
  itemId: z.string().describe("アイテムID"),
  name: z.string().describe("アイテム名"),
  description: z.string().describe("アイテム説明"),
  image: z.string().url().describe("アイテム画像URL (Firebase Storage PNG)"),
  movie: z
    .string()
    .url()
    .describe("アイテム効果動画URL (Firebase Storage Mov)"),
  effect: ItemEffectSchema.describe("アイテムの効果定義"),
});

export type Game = z.infer<typeof GameSchema>;
export type GameUser = z.infer<typeof GameUserSchema>;
export type CurrentProcess = z.infer<typeof CurrentProcessSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type User = z.infer<typeof UserSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type EffectTargetType = z.infer<typeof EffectTargetTypeSchema>;
export type ItemEffect = z.infer<typeof ItemEffectSchema>;
