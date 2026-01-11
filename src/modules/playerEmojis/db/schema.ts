import { createModuleTable } from "@common/db/schema-types";
import { integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const playerEmojisEmojis = createModuleTable("playeremojis__emojis", {
  playerId: integer("player_id").primaryKey(),
  emojiId: varchar("emoji_id").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export default {
  playerEmojisEmojis,
};

export type Emoji = typeof playerEmojisEmojis.$inferSelect;
