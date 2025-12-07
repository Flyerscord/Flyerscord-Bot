import Stumper from "stumper";
import { blueSkyState } from "../schema";
import Normalize from "@common/migration/Normalize";
import { BlueSkyActionType, IAuditLogInfo } from "../BlueSkyDB";
import { auditLog } from "@common/db/schema";

interface IRawBlueSkyRecord {
  id: string;
  data: string;
}

interface IRawHistoryRecord {
  id: string;
  data: {
    date: string;
    type: BlueSkyActionType;
    account: string;
    authorId: string;
  };
}

export default class BlueSkyNormalize extends Normalize {
  constructor() {
    super("BlueSky");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_blue-sky", this.migrateSettings.bind(this));
    await this.runMigration("raw_bluesky-history", this.migrateAccountHistory.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    const result = await this.validateCounts([
      {
        rawTableName: "raw_blue-sky",
        normalizedTable: blueSkyState,
      },
    ]);

    if (!result) {
      return false;
    }

    const auditLogCount = await this.getCountAuditLogs();
    const rawHistoryCount = await this.getRawTableCount("raw_bluesky-history");

    if (rawHistoryCount !== auditLogCount) {
      Stumper.error(`Raw history count ${rawHistoryCount} does not match audit log count ${auditLogCount}`, "BlueSky:Normalize:validate");
      return false;
    }

    return true;
  }

  private async migrateSettings(): Promise<number> {
    const rawSettings = await this.getRawTableData<IRawBlueSkyRecord>("raw_blue-sky");

    if (rawSettings.length === 0) {
      Stumper.warning("No settings to migrate", "BlueSky:Migration:Settings");
      return 0;
    }

    let migratedCount = 0;

    for (const rawRecord of rawSettings) {
      try {
        if (rawRecord.id === "lastPostTimeId") {
          await this.db
            .insert(blueSkyState)
            .values({ key: rawRecord.id, date: new Date(rawRecord.data) })
            .onConflictDoUpdate({
              target: blueSkyState.key,
              set: {
                date: new Date(rawRecord.data),
                updatedAt: new Date(),
              },
            });
        } else {
          await this.db
            .insert(blueSkyState)
            .values({ key: rawRecord.id, value: rawRecord.data })
            .onConflictDoUpdate({
              target: blueSkyState.key,
              set: {
                value: rawRecord.data,
                updatedAt: new Date(),
              },
            });
        }
        migratedCount++;
        Stumper.debug(`Migrated setting: ${rawRecord.id} = ${rawRecord.data}`, "BlueSky:Migration:Settings");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate setting ${rawRecord.id}: ${errorMessage}`, "BlueSky:Migration:Settings");
      }
    }

    return migratedCount;
  }

  private async migrateAccountHistory(): Promise<number> {
    const rawHistory = await this.getRawTableData<IRawHistoryRecord>("raw_bluesky-history");

    if (rawHistory.length === 0) {
      Stumper.warning("No account history to migrate", "BlueSky:Migration:History");
      return 0;
    }

    let migratedCount = 0;

    for (const rawRecord of rawHistory) {
      try {
        const auditLogInfo: IAuditLogInfo = {
          account: rawRecord.data.account,
        };

        await this.db.insert(auditLog).values({
          timestamp: new Date(rawRecord.data.date),
          moduleName: "BlueSky",
          action: rawRecord.data.type,
          userId: rawRecord.data.authorId,
          details: auditLogInfo,
        });
        migratedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate history record ${rawRecord.id}: ${errorMessage}`, "BlueSky:Migration:History");
      }
    }

    return migratedCount;
  }
}
