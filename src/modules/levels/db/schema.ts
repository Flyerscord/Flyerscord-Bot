import { createModuleTable } from "@common/db/schema-types";
import { index, integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const levelsLevelsExperience = createModuleTable("levels__levels_experience", {
  levelNumber: integer("level_number").primaryKey(),
  experience: integer("experience").notNull(),
});

export const levelsLevels = createModuleTable(
  "levels__levels",
  {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    totalExperience: integer("total_experience").notNull().default(0),
    currentLevel: integer("current_level").notNull().default(0),
    messageCount: integer("message_count").notNull().default(0),
    timeOfLastMessage: timestamp("time_of_last_message").notNull(),
  },
  (table) => [index("levels_total_experience_idx").on(table.totalExperience), index("levels_current_level_idx").on(table.currentLevel)],
);

export default {
  levelsLevelsExperience,
  levelsLevels,
};

export type LevelsUser = typeof levelsLevels.$inferSelect;

export type NewLevelsUser = typeof levelsLevels.$inferInsert;
