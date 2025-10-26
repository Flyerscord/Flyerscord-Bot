import { pgTable, varchar, text, timestamp, serial, pgEnum } from "drizzle-orm/pg-core";

// Enum for action types
export const actionTypeEnum = pgEnum("bluesky_action_type", ["ADD", "REMOVE"]);

// Settings table for configuration values like lastPostTime
export const blueSkySettings = pgTable("bluesky_settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Account history table for tracking account additions/removals
export const blueSkyAccountHistory = pgTable("bluesky_account_history", {
  id: serial("id").primaryKey(),
  account: varchar("account", { length: 255 }).notNull(),
  actionType: actionTypeEnum("action_type").notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export for schema registration
export default {
  blueSkySettings,
  blueSkyAccountHistory,
};
