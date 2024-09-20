import Database from "./Database";

export default class CacheDB extends Database {
  private static instance: CacheDB;

  private readonly COMMAND_LIST_MESSAGE_ID_KEY = "commandListMessageId";

  private constructor() {
    super({ name: "Cache" });
    this.db.ensure(this.COMMAND_LIST_MESSAGE_ID_KEY, "");
  }

  static getInstance(): CacheDB {
    return this.instance || (this.instance = new this());
  }

  /* -------------------------------------------------------------------------- */
  /*                           Command List Message ID                          */
  /* -------------------------------------------------------------------------- */

  getCommandListMessageId(): string {
    return this.db.get(this.COMMAND_LIST_MESSAGE_ID_KEY);
  }

  setCommandListMessageId(newMessageId: string): void {
    this.db.set(this.COMMAND_LIST_MESSAGE_ID_KEY, newMessageId);
  }
}
