/** 基本的なユーザー情報 */
export interface User {
  userId: string;
  teamName: string;
  thumbnail: string;
  characterImage: string;
  characterColor: string;
  prevScore: number;
  currentScore: number;
}

/** アニメーション用に拡張されたユーザー情報 */
export interface AnimatedUser extends User {
  animatedScore: number;           // アニメーション中の表示スコア
  isAnimating: boolean;            // アニメーション実行中フラグ
  isPromotionFromBottom?: boolean; // 下位(7位以降)から上位(6位以内)への昇格フラグ
  isDemotionToBottom?: boolean;    // 上位(6位以内)から下位(7位以降)への降格フラグ
  isRankDown?: boolean;            // 上位6位内での順位下降フラグ
  isRankUp?: boolean;              // 上位6位内での順位上昇フラグ
}

/** エフェクトのターゲット指定方法 */
export type EffectTargetType = 'rank_position' | 'specific_user' | 'all_users' | 'random_users';

/** 単一のエフェクト定義 */
export interface ItemEffect {
  targetType: EffectTargetType;
  targetValue?: number | string; // rank_position: 順位(1-based), specific_user: userId, random_users: 対象数
  scoreChange?: number; // スコア変動量（負の値で減点、正の値で加点）
  description: string; // エフェクトの説明文
}

/** アイテムイベント情報 */
export interface ItemEvent {
  userId: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  itemMovie: string;
  effect: ItemEffect;
}

/** タイヤ痕の表示データ */
export interface TireTrail {
  userId: string;
  startX: number;
  endX: number;
  laneIndex: number;
}