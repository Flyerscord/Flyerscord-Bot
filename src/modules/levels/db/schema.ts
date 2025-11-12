import { createModuleTable } from "@root/src/common/db/schema-types";
import { integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const levelsLevelsExperience = createModuleTable("levels__levels_experience", {
  levelNumber: integer("level_number").primaryKey(),
  experience: integer("experience").notNull(),
});

export const levelsLevels = createModuleTable("levels__levels", {
  userId: varchar("user_id", { length: 255 }).primaryKey(),
  totalExperience: integer("total_experience").notNull(),
  currentLevel: integer("current_level").notNull(),
  messageCount: integer("message_count").notNull(),
  timeOfLastMessage: timestamp("time_of_last_message").notNull(),
});

export default {
  levelsLevelsExperience,
  levelsLevels,
};
