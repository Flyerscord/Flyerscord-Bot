import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { LeftUser, leftUsers, NotVerifiedUser, notVerifiedUsers } from "./schema";
import { eq } from "drizzle-orm";

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

  async lockUser(userId: string): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ lock: true }).where(eq(notVerifiedUsers.userId, userId));
  }

  async unlockUser(userId: string): Promise<void> {
    await this.db.update(notVerifiedUsers).set({ lock: false }).where(eq(notVerifiedUsers.userId, userId));
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
