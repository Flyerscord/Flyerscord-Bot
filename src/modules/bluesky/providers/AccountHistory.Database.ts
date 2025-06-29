import Database from "@common/providers/Database";
import { HISTORY_ITEM_TYPE, IHistoryItem } from "../interfaces/IHistoryItem";

export default class AccountHistoryDB extends Database {
  constructor() {
    super({ name: "bluesky-history" });
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
