import { createModuleTable } from "@root/src/common/db/schema-types";
import { integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const playerEmojisEmojis = createModuleTable("player_emojis__emojis", {
  playerId: integer("player_id").primaryKey(),
  emojiId: varchar("emoji_id").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export default {
  playerEmojisEmojis,
};
