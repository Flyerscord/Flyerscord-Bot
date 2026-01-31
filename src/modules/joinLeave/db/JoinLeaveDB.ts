import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { LeftUser, leftUsers, NotVerifiedUser, notVerifiedUsers } from "./schema";
import { and, eq, isNotNull } from "drizzle-orm";

export default class JoinLeaveDB extends ModuleDatabase {
  constructor() {
    super("JoinLeave");
  }

  async addNotVerifiedUser(userId: string): Promise<void> {
    await this.db.insert(notVerifiedUsers).values({ userId });
  }

  async deleteNotVerifiedUser(userId: string): Promise<void> {
    await this.db.delete(notVerifiedUsers).where(eq(notVerifiedUsers.userId, userId));
  }

  async getNotVerifiedUsers(): Promise<NotVerifiedUser[]> {
    return await this.db.select().from(notVerifiedUsers);
  }

  async getNotVerifiedUser(userId: string): Promise<NotVerifiedUser | undefined> {
    return await this.getSingleRow(notVerifiedUsers, eq(notVerifiedUsers.userId, userId));
  }

  async incrementQuestionsAnswered(userId: string): Promise<void> {
    await this.db
      .update(notVerifiedUsers)
      .set({ questionsAnswered: this.increment(notVerifiedUsers.questionsAnswered) })
      .where(eq(notVerifiedUsers.userId, userId));
  }

  async unlockUser(userId: string): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ lock: false }).where(eq(notVerifiedUsers.userId, userId));
  }

  async isUserLocked(userId: string): Promise<boolean> {
    const result = await this.getSingleRow<NotVerifiedUser>(notVerifiedUsers, eq(notVerifiedUsers.userId, userId));
    return result?.lock ?? false;
  }

  async tryLockUser(userId: string): Promise<boolean> {
    const result = await this.db
      .update(notVerifiedUsers)
      .set({ lock: true })
      .where(and(eq(notVerifiedUsers.userId, userId), eq(notVerifiedUsers.lock, false)))
      .returning();
    return result.length > 0;
  }

  async incrementIncorrectAnswers(userId: string): Promise<void> {
    await this.db
      .update(notVerifiedUsers)
      .set({ incorrectAnswers: this.increment(notVerifiedUsers.incorrectAnswers) })
      .where(eq(notVerifiedUsers.userId, userId));
  }

  async resetIncorrectAnswers(userId: string): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ incorrectAnswers: 0 }).where(eq(notVerifiedUsers.userId, userId));
  }

  async getIncorrectAnswers(userId: string): Promise<number> {
    const result = await this.getSingleRowWithFields(notVerifiedUsers, eq(notVerifiedUsers.userId, userId), {
      incorrect: notVerifiedUsers.incorrectAnswers,
    });

    return result?.incorrect ?? 0;
  }

  async startTimeout(userId: string): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ timedoutAt: new Date() }).where(eq(notVerifiedUsers.userId, userId));
  }

  async removeTimeout(userId: string): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ timedoutAt: null }).where(eq(notVerifiedUsers.userId, userId));
  }

  async getTimeout(userId: string): Promise<Date | undefined> {
    const result = await this.getSingleRowWithFields(notVerifiedUsers, eq(notVerifiedUsers.userId, userId), {
      timeout: notVerifiedUsers.timedoutAt,
    });

    return result?.timeout ?? undefined;
  }

  async getTimeOutCount(userId: string): Promise<number> {
    const result = await this.getSingleRowWithFields(notVerifiedUsers, eq(notVerifiedUsers.userId, userId), {
      count: notVerifiedUsers.timeOutCount,
    });

    return result?.count ?? 0;
  }

  async incrementTimeOutCount(userId: string): Promise<void> {
    await this.db
      .update(notVerifiedUsers)
      .set({ timeOutCount: this.increment(notVerifiedUsers.timeOutCount) })
      .where(eq(notVerifiedUsers.userId, userId));
  }

  async setThreadId(userId: string, threadId: string): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ threadId }).where(eq(notVerifiedUsers.userId, userId));
  }

  async setAddedToThread(userId: string, addedToThread: boolean): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ addedToThread }).where(eq(notVerifiedUsers.userId, userId));
  }

  async isAddedToThread(userId: string): Promise<boolean> {
    const result = await this.getSingleRowWithFields(notVerifiedUsers, eq(notVerifiedUsers.userId, userId), {
      added: notVerifiedUsers.addedToThread,
    });

    return result?.added ?? false;
  }

  async getAllNotAddedToThread(): Promise<NotVerifiedUser[]> {
    return await this.db
      .select()
      .from(notVerifiedUsers)
      .where(and(eq(notVerifiedUsers.addedToThread, false), isNotNull(notVerifiedUsers.threadId), eq(notVerifiedUsers.lock, false)));
  }

  // Left Users
  async addLeftUser(userId: string, roles: string[]): Promise<void> {
    await this.db.insert(leftUsers).values({ userId, roles });
  }

  async deleteLeftUser(userId: string): Promise<void> {
    await this.db.delete(leftUsers).where(eq(leftUsers.userId, userId));
  }

  async getLeftUsers(): Promise<LeftUser[]> {
    return await this.db.select().from(leftUsers);
  }

  async getLeftUser(userId: string): Promise<LeftUser | undefined> {
    return await this.getSingleRow(leftUsers, eq(leftUsers.userId, userId));
  }
}
