import { ModuleDatabase } from "@root/src/common/models/ModuleDatabase";
import { visitorRoleState } from "./schema";
import { eq } from "drizzle-orm";

export default class VisitorRoleDB extends ModuleDatabase {
  constructor() {
    super("VisitorRole");
  }

  async getVisitorRoleMessageId(): Promise<string | undefined> {
    const result = await this.db
      .select({ messageId: visitorRoleState.value })
      .from(visitorRoleState)
      .where(eq(visitorRoleState.key, "visitorRoleMessageId"))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    return result[0].messageId;
  }

  async setVisitorRoleMessageId(messageId: string): Promise<void> {
    await this.db
      .insert(visitorRoleState)
      .values({ key: "visitorRoleMessageId", value: messageId })
      .onConflictDoUpdate({
        target: visitorRoleState.key,
        set: { value: messageId, updatedAt: new Date() },
      });
  }
}
