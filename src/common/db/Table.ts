import { getDb, NeonDB } from "./db";

export default abstract class Table {
  protected db: NeonDB;

  constructor() {
    this.db = getDb();
  }

  // TODO: Add common methods
}
