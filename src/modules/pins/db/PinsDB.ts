import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { Pin, pinsPins } from "./schema";
import { eq, sql } from "drizzle-orm";

export enum PinsActionType {
  ADD = "ADD",
  REMOVE = "REMOVE",
}

export default class PinsDB extends ModuleDatabase {
  constructor() {
    super("Pins");
  }

  async addPin(ogMessageId: string, ogChannelId: string, ogCreatedAt: Date, pinnedBy: string): Promise<Pin | undefined> {
    const results = await this.db
      .insert(pinsPins)
      .values({
        ogMessageId,
        ogChannelId,
        ogCreatedAt,
        pinnedBy,
      })
      .returning();

    if (results.length === 0) {
      return undefined;
    }

    return results[0];
  }

  async updateMessageId(originalMessageId: string, messageId: string): Promise<boolean> {
    const result = await this.db.update(pinsPins).set({ ogMessageId: messageId }).where(eq(pinsPins.ogMessageId, originalMessageId)).returning();

    if (result.length === 0) {
      return false;
    }

    return true;
  }

  async hasPin(ogMessageId: string): Promise<boolean> {
    return (
      (
        await this.db
          .select({ one: sql<number>`1` })
          .from(pinsPins)
          .where(eq(pinsPins.ogMessageId, ogMessageId))
      ).length > 0
    );
  }

  async deletePin(ogMessageId: string): Promise<boolean> {
    const result = await this.db.delete(pinsPins).where(eq(pinsPins.ogMessageId, ogMessageId)).returning();

    if (result.length === 0) {
      return false;
    }

    return true;
  }

  async getPin(ogMessageId: string): Promise<Pin | undefined> {
    const result = await this.db.select().from(pinsPins).where(eq(pinsPins.ogMessageId, ogMessageId));

    if (result.length === 0) {
      return undefined;
    }

    return result[0];
  }

  async getPinByMessageId(messageId: string): Promise<Pin | undefined> {
    const result = await this.db.select().from(pinsPins).where(eq(pinsPins.messageId, messageId));

    if (result.length === 0) {
      return undefined;
    }

    return result[0];
  }

  async getAllPins(): Promise<Pin[]> {
    return await this.db.select().from(pinsPins);
  }
}
