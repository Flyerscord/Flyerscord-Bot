import { createModuleTable } from "@common/db/schema-types";
import { boolean, index, integer, text, timestamp } from "drizzle-orm/pg-core";

export const notVerifiedUsers = createModuleTable(
  "joinleave__not_verified_users",
  {
    userId: text("user_id").primaryKey(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
    questionsAnswered: integer("questions_answered").default(0).notNull(),
    lock: boolean("lock").default(false).notNull(),
    incorrectAnswers: integer("incorrect_answers").default(0).notNull(),
    timedoutAt: timestamp("timedout_at"),
    timeOutCount: integer("time_out_count").default(0).notNull(),
  },
  (table) => [index("joinleave_added_at_idx").on(table.addedAt), index("joinleave_timedout_at_idx").on(table.timedoutAt)],
);

export const leftUsers = createModuleTable("joinleave__left_users", {
  userId: text("user_id").primaryKey(),
  leftAt: timestamp("left_at").defaultNow().notNull(),
  roles: text("roles").array().notNull().default([]),
});

export default {
  notVerifiedUsers,
  leftUsers,
};

export type NotVerifiedUser = typeof notVerifiedUsers.$inferSelect;
export type NewNotVerifiedUser = typeof notVerifiedUsers.$inferInsert;

export type LeftUser = typeof leftUsers.$inferSelect;
export type NewLeftUser = typeof leftUsers.$inferInsert;
