import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { eq } from "drizzle-orm";
import { reactionRoleMessages } from "./schema";

export default class ReactionRoleDB extends ModuleDatabase {
  constructor() {
    super("ReactionRole");
  }

  async hasReactionMessage(name: string): Promise<boolean> {
    return this.select1(reactionRoleMessages, eq(reactionRoleMessages.name, name));
  }

  async setReactionMessage(name: string, messageId: string): Promise<void> {
    await this.db
      .insert(reactionRoleMessages)
      .values({ name: name, messageId: messageId })
      .onConflictDoUpdate({
        target: reactionRoleMessages.name,
        set: {
          messageId: messageId,
        },
      });
  }

  async getReactionMessage(name: string): Promise<string | undefined> {
    const message = await this.db.select().from(reactionRoleMessages).where(eq(reactionRoleMessages.name, name));
    if (message.length === 0) {
      return undefined;
    }
    return message[0].messageId;
  }

  async getNameByMessageId(messageId: string): Promise<string | undefined> {
    const message = await this.db.select().from(reactionRoleMessages).where(eq(reactionRoleMessages.messageId, messageId));
    if (message.length === 0) {
      return undefined;
    }
    return message[0].name;
  }
}
