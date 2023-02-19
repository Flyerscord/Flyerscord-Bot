import Database from "./Database";

export default class VistorRoleDB extends Database {
  private static instance: VistorRoleDB;

  private readonly messageIdKey = "messageId";

  private constructor() {
    super({ name: "VistorRole" });
  }

  static getInstance(): VistorRoleDB {
    return this.instance || (this.instance = new this());
  }

  hasMessageId(): boolean {
    return this.db.has(this.messageIdKey);
  }

  setMessageId(newId: string): void {
    this.db.set(this.messageIdKey, newId);
  }

  getMessageId(): string | undefined {
    if (this.hasMessageId()) {
      return this.db.get(this.messageIdKey);
    }
    return undefined;
  }
}
