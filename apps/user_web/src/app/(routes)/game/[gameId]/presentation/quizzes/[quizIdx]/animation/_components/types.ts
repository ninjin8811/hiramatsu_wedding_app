import { type ItemEffect } from "@/app/_types";

/** 基本的なユーザー情報 */
export interface User {
  userId: string;
  teamName: string;
  thumbnail: string;
  smileThumbnail: string;
  sadThumbnail: string;
  cartImage: string;
  characterColor: string;
  prevScore: number;
  currentScore: number;
  correctRate: number; // ユーザーの正答率（0-1の範囲）
}

/** アニメーション用に拡張されたユーザー情報 */
export interface AnimatedUser extends User {
  animatedScore: number; // アニメーション中の表示スコア
  isAnimating: boolean; // アニメーション実行中フラグ
  isPromotionFromBottom?: boolean; // 下位(7位以降)から上位(6位以内)への昇格フラグ
  isDemotionToBottom?: boolean; // 上位(6位以内)から下位(7位以降)への降格フラグ
  isRankDown?: boolean; // 上位6位内での順位下降フラグ
  isRankUp?: boolean; // 上位6位内での順位上昇フラグ
  damageEffect?: {
    isVisible: boolean;
    itemId: string;
  }; // ダメージエフェクト情報
}

/** アイテムイベント情報 */
export interface ItemEvent {
  userId: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  itemMovie: string;
  priority: number;
  effect: ItemEffect;
  isCorrectAnswer: boolean; // アイテム使用者が問題に正解したかどうか
  userCorrectRate?: number; // アイテム使用者の正解率（0-1の範囲）
}

/** タイヤ痕の表示データ */
export interface TireTrail {
  userId: string;
  startX: number;
  endX: number;
  laneIndex: number;
}
