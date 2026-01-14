import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { NotVerifiedUser, notVerifiedUsers } from "./schema";
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
}
