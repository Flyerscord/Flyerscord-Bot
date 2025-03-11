import Database from "../../../common/providers/Database";

export default class ReactionMessageDB extends Database {
  constructor() {
    super({ name: "reaction-message" });
  }

  hasReactionMessage(reactionName: string): boolean {
    return this.db.has(reactionName);
  }

  setReactionMessage(reactionName: string, messageId: string): void {
    this.db.set(reactionName, messageId);
  }

  getReactionMessage(reactionName: string): string | undefined {
    if (!this.db.has(reactionName)) {
      return undefined;
    }
    return this.db.get(reactionName);
  }

  getNameByMessageId(messageId: string): string | undefined {
    for (const [key, value] of this.db.entries()) {
      if (value == messageId) {
        return key.toString();
      }
    }
    return undefined;
  }
}
