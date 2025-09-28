import { getDb, NeonDB } from "../db/db";

export default abstract class Normalize {
  protected readonly db: NeonDB;

  constructor() {
    this.db = getDb(false);
  }

  abstract normalize(): Promise<void>;

  abstract validate(): Promise<boolean>;
}
