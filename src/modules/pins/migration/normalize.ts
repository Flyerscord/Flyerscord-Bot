import Normalize from "@root/src/common/migration/Normalize";
import { pinsPins } from "../schema/schema";
import Stumper from "stumper";

interface IRawPinRecord {
  id: string;
  data: IRawPin;
}

interface IRawPin {
  pinnedAt: Date;
  pinnedBy: string;
  channelId: string;
  messageId: string;
  ogCreatedAt: Date;
  ogMessageId: string;
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
        await this.db
          .insert(pinsPins)
          .values({
            ogCreatedAt: rawPinRecord.data.ogCreatedAt,
            ogChannelId: rawPinRecord.data.channelId,
            ogMessageId: rawPinRecord.data.ogMessageId,
            messageId: rawPinRecord.data.messageId,
            pinnedBy: rawPinRecord.data.pinnedBy,
            pinnedAt: rawPinRecord.data.pinnedAt,
          })
          .onConflictDoUpdate({
            target: pinsPins.ogMessageId,
            set: {
              ogCreatedAt: rawPinRecord.data.ogCreatedAt,
              ogChannelId: rawPinRecord.data.channelId,
              messageId: rawPinRecord.data.messageId,
              pinnedBy: rawPinRecord.data.pinnedBy,
              pinnedAt: rawPinRecord.data.pinnedAt,
            },
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
