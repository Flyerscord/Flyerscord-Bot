import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { PrivateThread, privateThreads, PrivateThreadType, ticketExchangeState } from "./schema";
import { Result, ok, err } from "neverthrow";
import { and, eq } from "drizzle-orm";

export default class TicketExchangeDB extends ModuleDatabase {
  constructor() {
    super("TicketExchange", ticketExchangeState);
  }

  async setupTicketExchangeState(): Promise<void> {
    await this.ensureStateExists("startPostId", ticketExchangeState.stringValue, "");
  }

  async getStartPostId(): Promise<string> {
    const result = await this.getStateValue("startPostId");
    const { value } = result.unwrapOr(undefined) ?? { value: "" };
    return value as string;
  }

  async setStartPostId(postId: string): Promise<void> {
    await this.setStateValue("startPostId", ticketExchangeState.stringValue, postId);
  }

  async addPrivateThread(userId: string, type: PrivateThreadType, privateThreadId: string): Promise<Result<void, string>> {
    const result = await this.db.insert(privateThreads).values({ userId, type, privateThreadId }).onConflictDoNothing().returning();

    if (result.length > 0) {
      return ok();
    }
    return err("Failed to add private thread. Possibly already exists.");
  }

  async getPrivateThreadIdByUserId(userId: string, type: PrivateThreadType): Promise<string> {
    const result = await this.getSingleRow<PrivateThread>(privateThreads, and(eq(privateThreads.userId, userId), eq(privateThreads.type, type))!);
    if (!result) {
      return "";
    }
    return result.privateThreadId;
  }

  async getPrivateThreadIdByThreadId(threadId: string): Promise<PrivateThread | undefined> {
    const result = await this.getSingleRow<PrivateThread>(privateThreads, eq(privateThreads.privateThreadId, threadId));
    if (!result) {
      return undefined;
    }
    return result;
  }

  async deletePrivateThread(threadId: string): Promise<boolean> {
    const result = await this.db.delete(privateThreads).where(eq(privateThreads.privateThreadId, threadId)).returning();

    if (result.length > 0) {
      return true;
    }
    return false;
  }
}
