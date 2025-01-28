import Database from "../../../common/providers/Database";
import { HISTORY_ITEM_TYPE, IHistoryItem } from "../interfaces/IHistoryItem";

export default class AccountHistoryDB extends Database {
  private static instance: AccountHistoryDB;

  constructor() {
    super({ name: "bluesky-history" });
  }

  static getInstance(): AccountHistoryDB {
    return this.instance || (this.instance = new this());
  }

  addHistoryItem(type: HISTORY_ITEM_TYPE, account: string, authorId: string): void {
    const item: IHistoryItem = {
      type: type,
      account: account,
      date: new Date(),
      authorId: authorId,
    };
    this.db.set(this.db.autonum, item);
  }
}
