import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { and, desc, eq, sql } from "drizzle-orm";
import { Prediction, predictionsPredictions, predictionsState, PredictionsState } from "./schema";

export interface LeaderboardEntry {
  userId: string;
  points: number;
}

export default class PredictionsDB extends ModuleDatabase {
  constructor() {
    super("Predictions");
  }

  // Predictions

  async getPrediction(gameId: number, userId: string): Promise<Prediction | undefined> {
    return this.getSingleRow<Prediction>(
      predictionsPredictions,
      and(eq(predictionsPredictions.gameId, gameId), eq(predictionsPredictions.userId, userId))!,
    );
  }

  /**
   * Creates or overwrites a user's prediction for a game. Relies on the DB's unique `(gameId, userId)`
   * constraint to enforce "one prediction per user per game".
   */
  async upsertPrediction(
    gameId: number,
    userId: string,
    season: number,
    predictedHomeScore: number,
    predictedAwayScore: number,
  ): Promise<Prediction> {
    const inserted = await this.db
      .insert(predictionsPredictions)
      .values({ gameId, userId, season, predictedHomeScore, predictedAwayScore })
      .onConflictDoUpdate({
        target: [predictionsPredictions.gameId, predictionsPredictions.userId],
        set: { predictedHomeScore, predictedAwayScore, updatedAt: new Date() },
      })
      .returning();
    return inserted[0];
  }

  async getUnresolvedPredictionsForGame(gameId: number): Promise<Prediction[]> {
    return this.db
      .select()
      .from(predictionsPredictions)
      .where(and(eq(predictionsPredictions.gameId, gameId), eq(predictionsPredictions.resolved, false)));
  }

  async resolvePrediction(id: number, actualHomeScore: number, actualAwayScore: number, pointsAwarded: number): Promise<void> {
    await this.db
      .update(predictionsPredictions)
      .set({ actualHomeScore, actualAwayScore, pointsAwarded, resolved: true, updatedAt: new Date() })
      .where(eq(predictionsPredictions.id, id));
  }

  /**
   * Aggregates resolved points per user, optionally scoped to a single season. Leaderboard totals are
   * always computed from the source `predictionsPredictions` rows rather than a denormalized running
   * total, since prediction volume is low and this avoids the two ever drifting out of sync.
   */
  async getLeaderboard(season?: number): Promise<LeaderboardEntry[]> {
    const conditions = [eq(predictionsPredictions.resolved, true)];
    if (season !== undefined) {
      conditions.push(eq(predictionsPredictions.season, season));
    }

    const rows = await this.db
      .select({
        userId: predictionsPredictions.userId,
        points: sql<number>`COALESCE(SUM(${predictionsPredictions.pointsAwarded}), 0)::integer`,
      })
      .from(predictionsPredictions)
      .where(and(...conditions))
      .groupBy(predictionsPredictions.userId)
      .orderBy(desc(sql`COALESCE(SUM(${predictionsPredictions.pointsAwarded}), 0)`));

    return rows;
  }

  /**
   * Gets a user's 1-indexed rank on the points leaderboard, optionally scoped to a single season.
   * @returns -1 if the user has no resolved predictions in scope
   */
  async getUserRank(userId: string, season?: number): Promise<number> {
    const leaderboard = await this.getLeaderboard(season);
    const rank = leaderboard.findIndex((entry) => entry.userId === userId);
    return rank === -1 ? -1 : rank + 1;
  }

  async getUserPoints(userId: string, season?: number): Promise<number> {
    const leaderboard = await this.getLeaderboard(season);
    return leaderboard.find((entry) => entry.userId === userId)?.points ?? 0;
  }

  async getDistinctSeasons(): Promise<number[]> {
    const rows = await this.db
      .selectDistinct({ season: predictionsPredictions.season })
      .from(predictionsPredictions)
      .orderBy(desc(predictionsPredictions.season));
    return rows.map((row) => row.season);
  }

  // State

  async ensureStateRowExists(): Promise<void> {
    await this.db.insert(predictionsState).values({ id: 1 }).onConflictDoNothing();
  }

  async setState(gameId: number, season: number, gameStartTime: Date): Promise<void> {
    await this.db.update(predictionsState).set({ gameId, season, gameStartTime }).where(eq(predictionsState.id, 1));
  }

  async clearState(): Promise<void> {
    await this.db.update(predictionsState).set({ gameId: null, season: null, gameStartTime: null }).where(eq(predictionsState.id, 1));
  }

  async getState(): Promise<PredictionsState | undefined> {
    return this.getSingleRow<PredictionsState>(predictionsState, eq(predictionsState.id, 1));
  }
}
