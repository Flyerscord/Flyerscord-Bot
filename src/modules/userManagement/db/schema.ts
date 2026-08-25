import { createModuleEnum, createModuleTable } from "@common/db/schema-types";
import { index, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userManagementWarnings = createModuleTable(
  "usermanagement__warnings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    warnedBy: varchar("warned_by", { length: 255 }).notNull(),
    reason: text("reason").notNull(),
    messageId: varchar("message_id", { length: 255 }),
    channelId: varchar("channel_id", { length: 255 }),
    messageContent: text("message_content"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("usermanagement_warnings_user_id_idx").on(table.userId), index("usermanagement_warnings_created_at_idx").on(table.createdAt)],
);

export const userManagementNotes = createModuleTable(
  "usermanagement__notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    addedBy: varchar("added_by", { length: 255 }).notNull(),
    note: text("note").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("usermanagement_notes_user_id_idx").on(table.userId), index("usermanagement_notes_created_at_idx").on(table.createdAt)],
);

export enum ModerationEventType {
  BAN = "BAN",
  UNBAN = "UNBAN",
  KICK = "KICK",
}

export const moderationEventTypeEnum = createModuleEnum("usermanagement__moderation_event_type", ModerationEventType);

export const userManagementModerationEvents = createModuleTable(
  "usermanagement__moderation_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    type: moderationEventTypeEnum("type").notNull(),
    moderatorId: varchar("moderator_id", { length: 255 }),
    reason: text("reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("usermanagement_moderation_events_user_id_idx").on(table.userId),
    index("usermanagement_moderation_events_created_at_idx").on(table.createdAt),
  ],
);

export default {
  moderationEventTypeEnum,
  userManagementWarnings,
  userManagementNotes,
  userManagementModerationEvents,
};

export type Warning = typeof userManagementWarnings.$inferSelect;
export type Note = typeof userManagementNotes.$inferSelect;
export type ModerationEvent = typeof userManagementModerationEvents.$inferSelect;
