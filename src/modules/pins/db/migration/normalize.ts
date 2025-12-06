import Normalize from "@root/src/common/migration/Normalize";
import Stumper from "stumper";
import { auditLog } from "@root/src/common/db/schema";
import { PinsActionType } from "../ModuleDatabase";
import { pinsPins } from "../schema";

interface IRawPinRecord {
  id: string;
  data: IRawPin;
}

interface IRawPin {
  pinnedAt: string | Date;
  pinnedBy: string;
  channelId: string;
  messageId: string;
  ogCreatedAt: string | Date;
  orignalMessageId?: string; // Typo in original data
  ogMessageId?: string; // Correct spelling
}

export default class PinsNormalize extends Normalize {
  constructor() {
    super("Pins");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_pins", this.migratePins.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    return this.validateCounts([
      {
        rawTableName: "raw_pins",
        normalizedTable: pinsPins,
      },
    ]);
  }

  private async migratePins(): Promise<number> {
    const rawPins = await this.getRawTableData<IRawPinRecord>("raw_pins");

    if (rawPins.length === 0) {
      Stumper.warning("No pins to migrate", "Pins:Migration:Pins");
      return 0;
    }

    let migratedCount = 0;

    for (const rawPinRecord of rawPins) {
      try {
        // Handle the typo in the original data - it's "orignalMessageId" not "ogMessageId"
        const ogMessageId = rawPinRecord.data.ogMessageId || rawPinRecord.data.orignalMessageId;

        if (!ogMessageId) {
          Stumper.error(`Pin record ${rawPinRecord.id} is missing ogMessageId/orignalMessageId`, "Pins:Migration:Pins");
          continue;
        }

        // Convert string dates to Date objects if needed
        const ogCreatedAt =
          typeof rawPinRecord.data.ogCreatedAt === "string" ? new Date(rawPinRecord.data.ogCreatedAt) : rawPinRecord.data.ogCreatedAt;

        const pinnedAt = typeof rawPinRecord.data.pinnedAt === "string" ? new Date(rawPinRecord.data.pinnedAt) : rawPinRecord.data.pinnedAt;

        await this.db
          .insert(pinsPins)
          .values({
            ogCreatedAt: ogCreatedAt,
            ogChannelId: rawPinRecord.data.channelId,
            ogMessageId: ogMessageId,
            messageId: rawPinRecord.data.messageId,
            pinnedBy: rawPinRecord.data.pinnedBy,
            pinnedAt: pinnedAt,
          })
          .onConflictDoUpdate({
            target: pinsPins.ogMessageId,
            set: {
              ogCreatedAt: ogCreatedAt,
              ogChannelId: rawPinRecord.data.channelId,
              messageId: rawPinRecord.data.messageId,
              pinnedBy: rawPinRecord.data.pinnedBy,
              pinnedAt: pinnedAt,
            },
          });

        // Add the pin add to the audit log
        await this.db.insert(auditLog).values({
          timestamp: pinnedAt,
          moduleName: "Pins",
          action: PinsActionType.ADD,
          userId: rawPinRecord.data.pinnedBy,
        });

        migratedCount++;
        Stumper.debug(`Migrated pin record: ${rawPinRecord.id}`, "Pins:Migration:Pins");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate pin record ${rawPinRecord.id}: ${errorMessage}`, "Pins:Migration:Pins");
      }
    }

    return migratedCount;
  }
}
