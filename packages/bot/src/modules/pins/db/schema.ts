import { createModuleTable } from "@common/db/schema-types";
import { index, timestamp, varchar } from "drizzle-orm/pg-core";

export const pinsPins = createModuleTable(
  "pins__pins",
  {
    ogMessageId: varchar("og_message_id", { length: 255 }).primaryKey(),
    ogCreatedAt: timestamp("og_created_at").notNull(),
    ogChannelId: varchar("og_channel_id", { length: 255 }).notNull(),
    messageId: varchar("message_id", { length: 255 }),
    pinnedBy: varchar("pinned_by", { length: 255 }).notNull(),
    pinnedAt: timestamp("pinned_at").notNull().defaultNow(),
  },
  (table) => [
    index("pins_og_channel_id_idx").on(table.ogChannelId),
    index("pins_pinned_at_idx").on(table.pinnedAt),
    index("pins_pinned_by_idx").on(table.pinnedBy),
  ],
);

export default {
  pinsPins,
};

export type Pin = typeof pinsPins.$inferSelect;
