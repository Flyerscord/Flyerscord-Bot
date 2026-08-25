import { createModuleEnum, createModuleTable } from "@common/db/schema-types";
import { boolean, index, integer, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";

/**
 * Mirrors the NHL API's own `periodDescriptor.periodType` values, so actual game results can be
 * compared to a prediction without any translation.
 */
export enum PeriodType {
  REGULATION = "REG",
  OVERTIME = "OT",
  SHOOTOUT = "SO",
}
export const predictionsPeriodType = createModuleEnum("predictions__period_type_type", PeriodType);

export const predictionsPredictions = createModuleTable(
  "predictions__predictions",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    season: integer("season").notNull(),
    predictedHomeScore: integer("predicted_home_score").notNull(),
    predictedAwayScore: integer("predicted_away_score").notNull(),
    predictedPeriodType: predictionsPeriodType("predicted_period_type").notNull(),
    actualHomeScore: integer("actual_home_score"),
    actualAwayScore: integer("actual_away_score"),
    actualPeriodType: predictionsPeriodType("actual_period_type"),
    pointsAwarded: integer("points_awarded"),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("predictions_predictions_game_id_user_id_unique").on(table.gameId, table.userId),
    index("predictions_predictions_season_idx").on(table.season),
    index("predictions_predictions_user_id_idx").on(table.userId),
  ],
);

/**
 * Singleton row tracking the game predictions are currently open/locked/awaiting resolution for.
 * Used to re-arm the resolution task after a bot restart, the same way `nhl__live_data` does for the
 * NHL module's live-game polling.
 */
export const predictionsState = createModuleTable("predictions__state", {
  id: integer("id").primaryKey(),
  gameId: integer("game_id"),
  season: integer("season"),
  gameStartTime: timestamp("game_start_time"),
  announced: boolean("announced").notNull().default(false),
});

export default {
  predictionsPeriodType,
  predictionsPredictions,
  predictionsState,
};

export type Prediction = typeof predictionsPredictions.$inferSelect;
export type NewPrediction = typeof predictionsPredictions.$inferInsert;
export type PredictionsState = typeof predictionsState.$inferSelect;
