import Normalize from "@root/src/common/migration/Normalize";
import Stumper from "stumper";
import { daysUntilDates } from "../schema/schema";

interface IRawDaysUntilRecord {
  id: string;
  data: IRawDaysUntil;
}

interface IRawDaysUntil {
  enabled: boolean;
  date: number;
}

export default class DaysUntilNormalize extends Normalize {
  constructor() {
    super("DaysUntil");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_days-until", this.migrateDaysUntil.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    return this.validateCounts([
      {
        rawTableName: "raw_days-until",
        normalizedTable: daysUntilDates,
      },
    ]);
  }

  private async migrateDaysUntil(): Promise<number> {
    const rawDaysUntil = await this.getRawTableData<IRawDaysUntilRecord>("raw_days-until");

    if (rawDaysUntil.length === 0) {
      Stumper.warning("No days until to migrate", "DaysUntil:Migration:DaysUntil");
      return 0;
    }

    let migratedCount = 0;

    for (const rawDaysUntilRecord of rawDaysUntil) {
      try {
        await this.db
          .insert(daysUntilDates)
          .values({
            name: rawDaysUntilRecord.id,
            enabled: false,
          })
          .onConflictDoUpdate({
            target: daysUntilDates.name,
            set: {
              enabled: false,
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated days until record: ${rawDaysUntilRecord.id}`, "DaysUntil:Migration:DaysUntil");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate days until record ${rawDaysUntilRecord.id}: ${errorMessage}`, "DaysUntil:Migration:DaysUntil");
      }
    }

    return migratedCount;
  }
}
