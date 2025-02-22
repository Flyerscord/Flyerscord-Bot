export interface IHistoryItem {
  type: HISTORY_ITEM_TYPE;
  account: string;
  date: Date;
  authorId: string;
}

export enum HISTORY_ITEM_TYPE {
  ADD = "ADD",
  REMOVE = "REMOVE",
}
