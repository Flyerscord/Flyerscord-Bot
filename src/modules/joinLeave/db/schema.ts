import { createModuleTable } from "@common/db/schema-types";
import { boolean, integer, text, timestamp } from "drizzle-orm/pg-core";

export const notVerifiedUsers = createModuleTable("joinleave__not_verified_users", {
  userId: text("user_id").primaryKey(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  questionsAnswered: integer("questions_answered").default(0).notNull(),
  lock: boolean("lock").default(false).notNull(),
  incorrectAnswers: integer("incorrect_answers").default(0).notNull(),
  timedoutAt: timestamp("timedout_at"),
  timeOutCount: integer("time_out_count").default(0).notNull(),
});

export default {
  notVerifiedUsers,
};

export type NotVerifiedUser = typeof notVerifiedUsers.$inferSelect;
export type NewNotVerifiedUser = typeof notVerifiedUsers.$inferInsert;
