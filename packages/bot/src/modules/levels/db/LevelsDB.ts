import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { levelsLevels, levelsLevelsExperience, LevelsUser } from "./schema";
import { desc, lte, eq, sql } from "drizzle-orm";
import Stumper from "stumper";

export default class LevelsDB extends ModuleDatabase {
  constructor() {
    super("Levels");
  }

  // Level Experience

  async getNumberOfCalculatedLevels(): Promise<number> {
    return this.getRowsCount(levelsLevelsExperience);
  }

  async deleteAllLevels(): Promise<void> {
    await this.truncateTable(levelsLevelsExperience);
  }

  async addLevel(level: number, expRequired: number): Promise<void> {
    await this.db
      .insert(levelsLevelsExperience)
      .values({ levelNumber: level, experience: expRequired })
      .onConflictDoUpdate({
        target: levelsLevelsExperience.levelNumber,
        set: {
          experience: expRequired,
        },
      });
  }

  async getLevelFromExp(exp: number): Promise<number> {
    const result = await this.db
      .select()
      .from(levelsLevelsExperience)
      .where(lte(levelsLevelsExperience.experience, exp))
      .orderBy(desc(levelsLevelsExperience.levelNumber))
      .limit(1);

    if (result.length === 0) {
      return 0;
    }

    return result[0].levelNumber;
  }

  async getLevelExp(level: number): Promise<number> {
    const result = await this.db
      .select({ experience: levelsLevelsExperience.experience })
      .from(levelsLevelsExperience)
      .where(eq(levelsLevelsExperience.levelNumber, level));

    if (result.length === 0) {
      return 0;
    }

    return result[0].experience;
  }

  async getExpUntilNextLevel(currentLevel: number, currentExp: number): Promise<number> {
    Stumper.debug(`Getting exp until next level for level ${currentLevel} and current exp ${currentExp}`, "levels:LevelsDB:getExpUntilNextLevel");
    const nextLevelExp = await this.getLevelExp(currentLevel + 1);
    Stumper.debug(`Next level exp: ${nextLevelExp}`, "levels:LevelsDB:getExpUntilNextLevel");
    return nextLevelExp - currentExp;
  }

  // Levels

  async hasUser(userId: string): Promise<boolean> {
    return this.select1(levelsLevels, eq(levelsLevels.userId, userId));
  }

  async getUser(userId: string): Promise<LevelsUser | undefined> {
    const user = await this.db.select().from(levelsLevels).where(eq(levelsLevels.userId, userId));
    if (user.length === 0) {
      return undefined;
    }
    return user[0];
  }

  async addNewUser(userId: string): Promise<LevelsUser> {
    const result = await this.db
      .insert(levelsLevels)
      .values({ userId: userId, timeOfLastMessage: new Date(0) })
      .onConflictDoNothing()
      .returning();

    if (result.length > 0) {
      return result[0];
    }

    const existing = await this.db.select().from(levelsLevels).where(eq(levelsLevels.userId, userId)).limit(1);

    return existing[0];
  }

  async updateUser(userId: string, newUserLevel: LevelsUser): Promise<void> {
    await this.db.update(levelsLevels).set(newUserLevel).where(eq(levelsLevels.userId, userId));
  }

  async resetUser(userId: string): Promise<void> {
    await this.db.delete(levelsLevels).where(eq(levelsLevels.userId, userId));
  }

  async getAllUsers(): Promise<LevelsUser[]> {
    return await this.db.select().from(levelsLevels);
  }

  async getAllUsersSortedByExp(): Promise<LevelsUser[]> {
    return await this.db.select().from(levelsLevels).orderBy(desc(levelsLevels.totalExperience));
  }

  async getUserRank(userId: string): Promise<number> {
    const result = await this.db.execute<{ rank: number }>(sql`
      SELECT rank::integer FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_experience DESC) as rank
        FROM levels__levels
      ) ranked
      WHERE user_id = ${userId}
    `);

    if (result.length === 0) {
      return -1;
    }

    return result[0].rank;
  }
}
