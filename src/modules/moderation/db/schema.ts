import { createModuleEnum, createModuleTable } from "@common/db/schema-types";
import { integer, serial, text, timestamp } from "drizzle-orm/pg-core";

export enum WarningType {
  MESSAGE = "message",
  USER = "user",
}

export const WarningTypeEnum = createModuleEnum("moderation__warning_type", WarningType);

export const users = createModuleTable("moderation__users", {
  userId: text("user_id").primaryKey(),
  originalJoinDate: timestamp("original_join_date").notNull(),
});

export const kicks = createModuleTable("moderation__kicks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.userId),
  reason: text("reason").notNull(),
  moderatorId: text("moderator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bans = createModuleTable("moderation__bans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.userId),
  reason: text("reason").notNull(),
  moderatorId: text("moderator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mutes = createModuleTable("moderation__mutes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.userId),
  reason: text("reason").notNull(),
  duration: integer("duration").notNull(),
  moderatorId: text("moderator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const warnings = createModuleTable("moderation__warnings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.userId),
  reason: text("reason").notNull(),
  type: WarningTypeEnum("type").notNull(),
  moderatorId: text("moderator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notes = createModuleTable("moderation__notes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.userId),
  note: text("note").notNull(),
  moderatorId: text("moderator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export default {
  WarningTypeEnum,
  users,
  kicks,
  bans,
  mutes,
  warnings,
  notes,
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Kick = typeof kicks.$inferSelect;
export type NewKick = typeof kicks.$inferInsert;

export type Ban = typeof bans.$inferSelect;
export type NewBan = typeof bans.$inferInsert;

export type Mute = typeof mutes.$inferSelect;
export type NewMute = typeof mutes.$inferInsert;

export type Warning = typeof warnings.$inferSelect;
export type NewWarning = typeof warnings.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
