import { createModuleTable } from "@root/src/common/db/schema-types";
import { integer, varchar } from "drizzle-orm/pg-core";

export const gamedayPostsPosts = createModuleTable("gameday_posts__posts", {
  gameId: integer("game_id").primaryKey(),
  channelId: varchar("channel_id", { length: 255 }).notNull(),
});

export default {
  gamedayPostsPosts,
};
