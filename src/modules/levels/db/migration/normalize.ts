import Normalize from "@root/src/common/migration/Normalize";
import Stumper from "stumper";
import { levelsLevels, levelsLevelsExperience } from "../schema/schema";

interface IRawLevelExpRecord {
  id: string;
  data: number;
}

interface IRawUserLevelRecord {
  id: string;
  data: IRawUserLevel;
}

interface IRawUserLevel {
  userId: string;
  totalExp: number;
  currentLevel: number;
  messageCount: number;
  timeOfLastMessage: number;
}

export default class LevelsNormalize extends Normalize {
  constructor() {
    super("Levels");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_level-exp", this.migrateExperience.bind(this));
    await this.runMigration("raw_user-levels", this.migrateLevels.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    const countResult = await this.validateCounts([
      {
        rawTableName: "raw_level-exp",
        normalizedTable: levelsLevelsExperience,
      },
      {
        rawTableName: "raw_user-levels",
        normalizedTable: levelsLevels,
      },
    ]);

    if (!countResult) {
      return false;
    }

    // Get the first user level and make sure that the time of last message is a valid date and matches the value in the raw table
    const userLevel = await this.db.select().from(levelsLevels).orderBy(levelsLevels.userId).limit(1);
    if (userLevel.length === 0) {
      Stumper.error("No user levels to validate", "Levels:Migration:validate");
      return false;
    }

    const rawUserLevel = await this.getRawTableRow<IRawUserLevelRecord>("raw_user-levels", userLevel[0].userId);
    if (!rawUserLevel) {
      Stumper.error("No raw user level to validate", "Levels:Migration:validate");
      return false;
    }
    const dateInMilliSeconds = userLevel[0].timeOfLastMessage.getTime();

    if (rawUserLevel.data.timeOfLastMessage != dateInMilliSeconds) {
      Stumper.error("Time of last message does not match raw time of last message", "Levels:Migration:validate");
      return false;
    }

    return true;
  }

  private async migrateExperience(): Promise<number> {
    const rawLevelExp = await this.getRawTableData<IRawLevelExpRecord>("raw_level-exp");

    if (rawLevelExp.length === 0) {
      Stumper.warning("No level exp to migrate", "Levels:Migration:LevelExp");
      return 0;
    }

    let migratedCount = 0;

    for (const rawLevelExpRecord of rawLevelExp) {
      if (isNaN(parseInt(rawLevelExpRecord.id))) {
        Stumper.error(`Level exp record ${rawLevelExpRecord.id} is not a number`, "Levels:Migration:LevelExp");
        continue;
      }

      try {
        await this.db
          .insert(levelsLevelsExperience)
          .values({
            levelNumber: parseInt(rawLevelExpRecord.id),
            experience: rawLevelExpRecord.data,
          })
          .onConflictDoUpdate({
            target: levelsLevelsExperience.levelNumber,
            set: {
              experience: rawLevelExpRecord.data,
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated level exp record: ${rawLevelExpRecord.id}`, "Levels:Migration:LevelExp");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate level exp record ${rawLevelExpRecord.id}: ${errorMessage}`, "Levels:Migration:LevelExp");
      }
    }

    return migratedCount;
  }

  private async migrateLevels(): Promise<number> {
    const rawUserLevels = await this.getRawTableData<IRawUserLevelRecord>("raw_user-levels");

    if (rawUserLevels.length === 0) {
      Stumper.warning("No user levels to migrate", "Levels:Migration:UserLevels");
      return 0;
    }

    let migratedCount = 0;

    for (const rawUserLevelRecord of rawUserLevels) {
      try {
        await this.db
          .insert(levelsLevels)
          .values({
            userId: rawUserLevelRecord.data.userId,
            totalExperience: rawUserLevelRecord.data.totalExp,
            currentLevel: rawUserLevelRecord.data.currentLevel,
            messageCount: rawUserLevelRecord.data.messageCount,
            timeOfLastMessage: new Date(rawUserLevelRecord.data.timeOfLastMessage),
          })
          .onConflictDoUpdate({
            target: levelsLevels.userId,
            set: {
              totalExperience: rawUserLevelRecord.data.totalExp,
              currentLevel: rawUserLevelRecord.data.currentLevel,
              messageCount: rawUserLevelRecord.data.messageCount,
              timeOfLastMessage: new Date(rawUserLevelRecord.data.timeOfLastMessage),
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated user level record: ${rawUserLevelRecord.id}`, "Levels:Migration:UserLevels");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate user level record ${rawUserLevelRecord.id}: ${errorMessage}`, "Levels:Migration:UserLevels");
      }
    }
    return migratedCount;
  }
}
