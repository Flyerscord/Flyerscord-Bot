import { createModuleTable } from "@common/db/schema-types";
import { index, integer, varchar } from "drizzle-orm/pg-core";

export const gamedayPostsPosts = createModuleTable(
  "gamedayposts__posts",
  {
    gameId: integer("game_id").primaryKey(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
  },
  (table) => [index("gamedayposts_channel_id_idx").on(table.channelId)],
);

export default {
  gamedayPostsPosts,
};

export type GameDayPost = typeof gamedayPostsPosts.$inferSelect;
