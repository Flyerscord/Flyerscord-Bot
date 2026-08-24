import { createModuleEnum, createModuleTable } from "@common/db/schema-types";
import { index, integer, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";

export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  EXPERT = "Expert",
}
export const fantasySkillLevel = createModuleEnum("fantasy__skill_level_type", SkillLevel);

export enum SeasonStatus {
  OPEN = "open",
  CLOSING = "closing",
  PENDING_APPROVAL = "pending_approval",
  CLOSED = "closed",
}
export const fantasySeasonStatus = createModuleEnum("fantasy__season_status_type", SeasonStatus);

/**
 * Allowed player counts for a single team. Team sizes for a skill level don't all have to match -
 * see `computeTeamSizes` in `utils/closeSeason.ts` for how a signup total gets split across them.
 */
export const VALID_TEAM_SIZES = [8, 10, 12] as const;

export const fantasySeasons = createModuleTable("fantasy__seasons", {
  id: serial("id").primaryKey(),
  signupDeadline: timestamp("signup_deadline").notNull(),
  status: fantasySeasonStatus("status").notNull().default(SeasonStatus.OPEN),
  signupMessageId: varchar("signup_message_id", { length: 255 }),
  signupChannelId: varchar("signup_channel_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const fantasySignups = createModuleTable(
  "fantasy__signups",
  {
    id: serial("id").primaryKey(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => fantasySeasons.id),
    userId: varchar("user_id", { length: 255 }).notNull(),
    skillLevel: fantasySkillLevel("skill_level").notNull(),
    /**
     * The team a signup was finalized onto, numbered 1..N within its (seasonId, skillLevel). Not a
     * foreign key: teams are computed at close time from signup totals rather than pre-registered.
     */
    assignedTeamNumber: integer("assigned_team_number"),
    signedUpAt: timestamp("signed_up_at").notNull().defaultNow(),
  },
  (table) => [
    unique("fantasy_signups_season_id_user_id_unique").on(table.seasonId, table.userId),
    index("fantasy_signups_season_id_skill_level_idx").on(table.seasonId, table.skillLevel),
  ],
);

export const fantasyCommissionerSignups = createModuleTable(
  "fantasy__commissioner_signups",
  {
    id: serial("id").primaryKey(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => fantasySeasons.id),
    userId: varchar("user_id", { length: 255 }).notNull(),
    signedUpAt: timestamp("signed_up_at").notNull().defaultNow(),
  },
  (table) => [unique("fantasy_commissioner_signups_season_id_user_id_unique").on(table.seasonId, table.userId)],
);

export const fantasyTeamNames = createModuleTable(
  "fantasy__team_names",
  {
    id: serial("id").primaryKey(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => fantasySeasons.id),
    skillLevel: fantasySkillLevel("skill_level").notNull(),
    teamNumber: integer("team_number").notNull(),
    customName: varchar("custom_name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [unique("fantasy_team_names_season_id_skill_level_team_number_unique").on(table.seasonId, table.skillLevel, table.teamNumber)],
);

export default {
  fantasySkillLevel,
  fantasySeasonStatus,
  fantasySeasons,
  fantasySignups,
  fantasyCommissionerSignups,
  fantasyTeamNames,
};

export type FantasySeason = typeof fantasySeasons.$inferSelect;
export type FantasySignup = typeof fantasySignups.$inferSelect;
export type FantasyCommissionerSignup = typeof fantasyCommissionerSignups.$inferSelect;
export type FantasyTeamName = typeof fantasyTeamNames.$inferSelect;
