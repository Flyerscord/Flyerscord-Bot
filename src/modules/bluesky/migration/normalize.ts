import Stumper from "stumper";
import { blueSkySettings, blueSkyAccountHistory } from "../schema/schema";
import Normalize from "@common/migration/Normalize";

interface IRawBlueSkyRecord {
  id: string;
  data: string;
}

interface IRawHistoryRecord {
  id: string;
  data: {
    date: string;
    type: "ADD" | "REMOVE";
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

  async validate(): Promise<boolean> {
    return await this.validateCounts([
      {
        rawTableName: "raw_blue-sky",
        normalizedTable: blueSkySettings,
      },
      {
        rawTableName: "raw_bluesky-history",
        normalizedTable: blueSkyAccountHistory,
      },
    ]);
  }

  private async migrateSettings(): Promise<number> {
    const rawSettings = (await this.getRawTableData("raw_blue-sky")) as IRawBlueSkyRecord[];

    if (rawSettings.length === 0) {
      Stumper.warning("No settings to migrate", "BlueSky:Migration:Settings");
      return 0;
    }

    let migratedCount = 0;

    for (const rawRecord of rawSettings) {
      try {
        await this.db
          .insert(blueSkySettings)
          .values({ key: rawRecord.id, value: rawRecord.data })
          .onConflictDoUpdate({
            target: blueSkySettings.key,
            set: {
              value: rawRecord.data,
              updatedAt: new Date(),
            },
          });
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
    const rawHistory = (await this.getRawTableData("raw_bluesky-history")) as IRawHistoryRecord[];

    if (rawHistory.length === 0) {
      Stumper.warning("No account history to migrate", "BlueSky:Migration:History");
      return 0;
    }

    let migratedCount = 0;

    for (const rawRecord of rawHistory) {
      try {
        await this.db.insert(blueSkyAccountHistory).values({
          account: rawRecord.data.account,
          actionType: rawRecord.data.type,
          authorId: rawRecord.data.authorId,
          createdAt: new Date(rawRecord.data.date),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate history record ${rawRecord.id}: ${errorMessage}`, "BlueSky:Migration:History");
      }
    }

    return migratedCount;
  }
}
