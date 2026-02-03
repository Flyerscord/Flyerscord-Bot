import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { Ban, bans, Kick, kicks, Mute, mutes, Note, notes, User, users, Warning, warnings, WarningType } from "./schema";
import { eq } from "drizzle-orm";

export default class ModerationDB extends ModuleDatabase {
  constructor() {
    super("Moderation");
  }

  async addUser(userId: string, originalJoinDate: Date): Promise<void> {
    await this.db.insert(users).values({ userId, originalJoinDate });
  }

  async getUser(userId: string): Promise<User | undefined> {
    return await this.getSingleRow(users, eq(users.userId, userId));
  }

  async addKick(userId: string, reason: string, moderatorId: string): Promise<void> {
    await this.db.insert(kicks).values({ userId, reason, moderatorId });
  }

  async getKicks(userId: string): Promise<Kick[]> {
    return await this.db.select().from(kicks).where(eq(kicks.userId, userId));
  }

  async addBan(userId: string, reason: string, moderatorId: string): Promise<void> {
    await this.db.insert(bans).values({ userId, reason, moderatorId });
  }

  async getBans(userId: string): Promise<Ban[]> {
    return await this.db.select().from(bans).where(eq(bans.userId, userId));
  }

  async addMute(userId: string, reason: string, moderatorId: string, duration: number): Promise<void> {
    await this.db.insert(mutes).values({ userId, reason, moderatorId, duration });
  }

  async getMutes(userId: string): Promise<Mute[]> {
    return await this.db.select().from(mutes).where(eq(mutes.userId, userId));
  }

  async addWarning(userId: string, reason: string, type: WarningType, moderatorId: string): Promise<void> {
    await this.db.insert(warnings).values({ userId, reason, type, moderatorId });
  }

  async getWarnings(userId: string): Promise<Warning[]> {
    return await this.db.select().from(warnings).where(eq(warnings.userId, userId));
  }

  async addNote(userId: string, note: string, moderatorId: string): Promise<void> {
    await this.db.insert(notes).values({ userId, note, moderatorId });
  }

  async getNotes(userId: string): Promise<Note[]> {
    return await this.db.select().from(notes).where(eq(notes.userId, userId));
  }
}
