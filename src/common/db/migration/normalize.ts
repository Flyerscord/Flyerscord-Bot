import Normalize from "@common/migration/Normalize";
import { BlueSkyActionType } from "@root/src/modules/bluesky/db/ModuleDatabase";
import Stumper from "stumper";
import { auditLog } from "../schema";

interface IRawHistoryRecord {
  id: string;
  data: {
    date: string;
    type: BlueSkyActionType;
    account: string;
    authorId: string;
  };
}

export default class CommonNormalize extends Normalize {
  constructor() {
    super("common");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_bluesky-history", this.migrateBlueSkyHistory.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    let totalRawCount = 0;
    totalRawCount += await this.getRawTableCount("raw_bluesky-history");

    const auditLogCount = await this.getNormalizedTableCount(auditLog);

    return totalRawCount === auditLogCount;
  }

  private async migrateBlueSkyHistory(): Promise<number> {
    const rawHistory = await this.getRawTableData<IRawHistoryRecord>("raw_bluesky-history");

    if (rawHistory.length === 0) {
      Stumper.warning("No account history to migrate", "Common:Migration:BlueSkyHistory");
      return 0;
    }

    let migratedCount = 0;

    for (const rawRecord of rawHistory) {
      try {
        await this.db.insert(auditLog).values({
          timestamp: new Date(rawRecord.data.date),
          moduleName: "BlueSky",
          action: rawRecord.data.type,
          userId: rawRecord.data.authorId,
        });
        migratedCount++;
        Stumper.debug(`Migrated setting: ${rawRecord.id} = ${rawRecord.data}`, "BlueSky:Migration:Settings");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate history record ${rawRecord.id}: ${errorMessage}`, "Common:Migration:BlueSkyHistory");
      }
    }

    return migratedCount;
  }

  private async migrateCustomCommandsHistory(): Promise<number> {}
}
