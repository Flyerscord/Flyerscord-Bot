import { createModuleTable } from "@common/db/schema-types";
import { timestamp, varchar } from "drizzle-orm/pg-core";

export const pinsPins = createModuleTable("pins__pins", {
  ogMessageId: varchar("og_message_id", { length: 255 }).primaryKey(),
  ogCreatedAt: timestamp("og_created_at").notNull(),
  ogChannelId: varchar("og_channel_id", { length: 255 }).notNull(),
  messageId: varchar("message_id", { length: 255 }),
  pinnedBy: varchar("pinned_by", { length: 255 }).notNull(),
  pinnedAt: timestamp("pinned_at").notNull().defaultNow(),
});

export default {
  pinsPins,
};

export type Pin = typeof pinsPins.$inferSelect;
