import { ItemEvent } from "./types";

/**
 * kinokoアイテム（kinoko、special_kinoko）に関する処理を管理するサービスクラス
 */
export class KinokoService {
  private static readonly KINOKO_ITEM_ID = "kinoko" as const;
  private static readonly SPECIAL_KINOKO_ITEM_ID = "special_kinoko" as const;
  private static readonly KINOKO_ITEM_IDS = [
    this.KINOKO_ITEM_ID,
    this.SPECIAL_KINOKO_ITEM_ID,
  ] as const;

  private static readonly KINOKO_IMAGE_URL =
    "https://firebasestorage.googleapis.com/v0/b/fussa-wedding-app-prod/o/items%2Fkinoko.png?alt=media&token=8c042c21-f6fa-4375-b1fc-f4c7aa1d2ad7" as const;
  private static readonly SPECIAL_KINOKO_IMAGE_URL =
    "https://firebasestorage.googleapis.com/v0/b/fussa-wedding-app-prod/o/items%2Fspecial_kinoko.png?alt=media&token=8c042c21-f6fa-4375-b1fc-f4c7aa1d2ad7" as const;

  /**
   * kinoko系アイテム（kinoko、special_kinoko）を使用したユーザーのIDリストを取得
   * @param itemEvents アイテムイベントの配列
   * @returns kinoko系アイテムを使用したユーザーIDの配列
   */
  static getKinokoUserIds(itemEvents: ItemEvent[]): string[] {
    return itemEvents
      .filter((event) => this.isKinokoRelatedItem(event.itemId))
      .map((event) => event.userId);
  }

  /**
   * 通常のkinokoアイテムのみを使用したユーザーのIDリストを取得
   * @param itemEvents アイテムイベントの配列
   * @returns kinokoアイテムを使用したユーザーIDの配列
   */
  static getRegularKinokoUserIds(itemEvents: ItemEvent[]): string[] {
    return itemEvents
      .filter((event) => event.itemId === this.KINOKO_ITEM_ID)
      .map((event) => event.userId);
  }

  /**
   * special_kinokoアイテムを使用したユーザーのIDリストを取得
   * @param itemEvents アイテムイベントの配列
   * @returns special_kinokoアイテムを使用したユーザーIDの配列
   */
  static getSpecialKinokoUserIds(itemEvents: ItemEvent[]): string[] {
    return itemEvents
      .filter((event) => event.itemId === this.SPECIAL_KINOKO_ITEM_ID)
      .map((event) => event.userId);
  }

  /**
   * kinoko系の動画が再生完了したかをチェック
   * @param playedItems 再生完了したアイテムのSet
   * @returns kinoko系の動画が再生完了したかどうか
   */
  static hasKinokoMoviePlayed(playedItems: Set<string>): boolean {
    return this.KINOKO_ITEM_IDS.some((itemId) => playedItems.has(itemId));
  }

  /**
   * 通常のkinokoの動画が再生完了したかをチェック
   * @param playedItems 再生完了したアイテムのSet
   * @returns kinoko動画が再生完了したかどうか
   */
  static hasRegularKinokoMoviePlayed(playedItems: Set<string>): boolean {
    return playedItems.has(this.KINOKO_ITEM_ID);
  }

  /**
   * special_kinokoの動画が再生完了したかをチェック
   * @param playedItems 再生完了したアイテムのSet
   * @returns special_kinoko動画が再生完了したかどうか
   */
  static hasSpecialKinokoMoviePlayed(playedItems: Set<string>): boolean {
    return playedItems.has(this.SPECIAL_KINOKO_ITEM_ID);
  }

  /**
   * 動画再生完了後にのみ表示するkinokoユーザーのIDを取得
   * @param kinokoUserIds kinokoを使用したユーザーIDの配列
   * @param playedItems 再生完了したアイテムのSet
   * @returns 表示すべきkinokoユーザーIDの配列
   */
  static getPlayedKinokoUserIds(
    kinokoUserIds: string[],
    playedItems: Set<string>
  ): string[] {
    return this.hasKinokoMoviePlayed(playedItems) ? kinokoUserIds : [];
  }

  /**
   * ユーザーがkinokoアイテムを使用したかチェック
   * @param userId チェック対象のユーザーID
   * @param kinokoUserIds kinokoを使用したユーザーIDの配列
   * @returns ユーザーがkinokoアイテムを使用したかどうか
   */
  static isKinokoUser(userId: string, kinokoUserIds: string[]): boolean {
    return kinokoUserIds.includes(userId);
  }

  /**
   * kinoko系アイテムかどうかをチェック
   * @param itemId チェック対象のアイテムID
   * @returns アイテムがkinoko系かどうか
   */
  static isKinokoRelatedItem(itemId: string): boolean {
    return (this.KINOKO_ITEM_IDS as readonly string[]).includes(itemId);
  }

  /**
   * 通常のkinokoアイテムかどうかをチェック
   * @param itemId チェック対象のアイテムID
   * @returns アイテムが通常のkinokoかどうか
   */
  static isRegularKinokoItem(itemId: string): boolean {
    return itemId === this.KINOKO_ITEM_ID;
  }

  /**
   * special_kinokoアイテムかどうかをチェック
   * @param itemId チェック対象のアイテムID
   * @returns アイテムがspecial_kinokoかどうか
   */
  static isSpecialKinokoItem(itemId: string): boolean {
    return itemId === this.SPECIAL_KINOKO_ITEM_ID;
  }

  /**
   * kinoko系アイテムの画像URLを取得
   * @param itemId アイテムID
   * @returns 対応するアイテムの画像URL
   */
  static getKinokoImageUrl(itemId?: string): string {
    if (itemId === this.SPECIAL_KINOKO_ITEM_ID) {
      return this.SPECIAL_KINOKO_IMAGE_URL;
    }
    return this.KINOKO_IMAGE_URL; // デフォルトは通常のkinoko
  }

  /**
   * 通常のkinokoアイテムの画像URLを取得
   * @returns kinokoアイテムの画像URL
   */
  static getRegularKinokoImageUrl(): string {
    return this.KINOKO_IMAGE_URL;
  }

  /**
   * special_kinokoアイテムの画像URLを取得
   * @returns special_kinokoアイテムの画像URL
   */
  static getSpecialKinokoImageUrl(): string {
    return this.SPECIAL_KINOKO_IMAGE_URL;
  }

  /**
   * kinokoアイテムIDを取得
   * @returns kinokoアイテムID
   */
  static getKinokoItemId(): string {
    return this.KINOKO_ITEM_ID;
  }

  /**
   * special_kinokoアイテムIDを取得
   * @returns special_kinokoアイテムID
   */
  static getSpecialKinokoItemId(): string {
    return this.SPECIAL_KINOKO_ITEM_ID;
  }

  /**
   * アイテムがkinokoかどうかをチェック（後方互換性のため）
   * @param itemId チェック対象のアイテムID
   * @returns アイテムがkinoko系かどうか
   */
  static isKinokoItem(itemId: string): boolean {
    return this.isKinokoRelatedItem(itemId);
  }

  /**
   * 指定されたユーザーがkinokoアイテムを使って不正解だったかをチェック
   * @param userId チェック対象のユーザーID
   * @param itemEvents アイテムイベントの配列
   * @returns ユーザーがkinokoアイテムで不正解だったかどうか
   */
  static isKinokoIncorrectUser(
    userId: string,
    itemEvents: ItemEvent[]
  ): boolean {
    const userKinokoEvent = itemEvents.find(
      (event) =>
        event.userId === userId && this.isKinokoRelatedItem(event.itemId)
    );
    return userKinokoEvent ? !userKinokoEvent.isCorrectAnswer : false;
  }
}
