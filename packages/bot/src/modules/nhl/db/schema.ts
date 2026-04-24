import { createModuleTable } from "@common/db/schema-types";
import { timestamp, index, integer, varchar } from "drizzle-orm/pg-core";

export const gamedayPostsPosts = createModuleTable(
  "nhl__posts",
  {
    gameId: integer("game_id").primaryKey(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
  },
  (table) => [index("nhl_channel_id_idx").on(table.channelId)],
);

// Single row table
export const liveData = createModuleTable("nhl__live_data", {
  id: integer("id").primaryKey(),
  gameId: integer("game_id"),
  gameStartTime: timestamp("game_start_time"),
  currentPeriod: integer("current_period"),
});

export default {
  gamedayPostsPosts,
  liveData,
};

export type GameDayPost = typeof gamedayPostsPosts.$inferSelect;

export type LiveData = typeof liveData.$inferSelect;
