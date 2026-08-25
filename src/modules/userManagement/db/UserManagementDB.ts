import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { desc, eq } from "drizzle-orm";
import {
  ModerationEvent,
  ModerationEventType,
  Note,
  userManagementModerationEvents,
  userManagementNotes,
  userManagementWarnings,
  Warning,
} from "./schema";

export enum UserManagementActionType {
  ADD_WARNING = "ADD_WARNING",
  ADD_NOTE = "ADD_NOTE",
  ADD_MODERATION_EVENT = "ADD_MODERATION_EVENT",
}

export type HistoryEntry = { kind: "warning"; entry: Warning } | { kind: "note"; entry: Note } | { kind: "moderationEvent"; entry: ModerationEvent };

export default class UserManagementDB extends ModuleDatabase {
  constructor() {
    super("UserManagement");
  }

  async addWarning(
    userId: string,
    warnedBy: string,
    reason: string,
    messageId?: string,
    channelId?: string,
    messageContent?: string,
  ): Promise<Warning | undefined> {
    const results = await this.db
      .insert(userManagementWarnings)
      .values({ userId, warnedBy, reason, messageId, channelId, messageContent })
      .returning();

    void this.createAuditLog({
      action: UserManagementActionType.ADD_WARNING,
      userId,
      details: { warnedBy, reason, messageId, channelId },
    });

    return results[0];
  }

  async addNote(userId: string, addedBy: string, note: string): Promise<Note | undefined> {
    const results = await this.db.insert(userManagementNotes).values({ userId, addedBy, note }).returning();

    void this.createAuditLog({
      action: UserManagementActionType.ADD_NOTE,
      userId,
      details: { addedBy, note },
    });

    return results[0];
  }

  async addModerationEvent(userId: string, type: ModerationEventType, moderatorId?: string, reason?: string): Promise<ModerationEvent | undefined> {
    const results = await this.db.insert(userManagementModerationEvents).values({ userId, type, moderatorId, reason }).returning();

    void this.createAuditLog({
      action: UserManagementActionType.ADD_MODERATION_EVENT,
      userId,
      details: { type, moderatorId, reason },
    });

    return results[0];
  }

  async getWarnings(userId: string): Promise<Warning[]> {
    return await this.db
      .select()
      .from(userManagementWarnings)
      .where(eq(userManagementWarnings.userId, userId))
      .orderBy(desc(userManagementWarnings.createdAt));
  }

  async getNotes(userId: string): Promise<Note[]> {
    return await this.db
      .select()
      .from(userManagementNotes)
      .where(eq(userManagementNotes.userId, userId))
      .orderBy(desc(userManagementNotes.createdAt));
  }

  async getModerationEvents(userId: string): Promise<ModerationEvent[]> {
    return await this.db
      .select()
      .from(userManagementModerationEvents)
      .where(eq(userManagementModerationEvents.userId, userId))
      .orderBy(desc(userManagementModerationEvents.createdAt));
  }

  /**
   * Merges a user's warnings, notes, and moderation events (bans/unbans/kicks) into a single
   * chronological history, newest first.
   * @param userId - The Discord user ID to fetch history for
   * @returns The user's combined history entries, sorted by creation time descending
   */
  async getHistory(userId: string): Promise<HistoryEntry[]> {
    const [warnings, notes, moderationEvents] = await Promise.all([
      this.getWarnings(userId),
      this.getNotes(userId),
      this.getModerationEvents(userId),
    ]);

    const entries: HistoryEntry[] = [
      ...warnings.map((entry): HistoryEntry => ({ kind: "warning", entry })),
      ...notes.map((entry): HistoryEntry => ({ kind: "note", entry })),
      ...moderationEvents.map((entry): HistoryEntry => ({ kind: "moderationEvent", entry })),
    ];

    return entries.sort((a, b) => b.entry.createdAt.getTime() - a.entry.createdAt.getTime());
  }
}
