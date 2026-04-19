import { createModuleTable } from "@common/db/schema-types";
import { index, integer, varchar } from "drizzle-orm/pg-core";

export const gamedayPostsPosts = createModuleTable(
  "nhl__posts",
  {
    gameId: integer("game_id").primaryKey(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
  },
  (table) => [index("nhl_channel_id_idx").on(table.channelId)],
);

export const liveData = createModuleTable("nhl__live_data", {
  gameId: integer("game_id").primaryKey(),
  currentPeriod: integer("current_period"),
});

export default {
  gamedayPostsPosts,
  liveData,
};

export type GameDayPost = typeof gamedayPostsPosts.$inferSelect;
