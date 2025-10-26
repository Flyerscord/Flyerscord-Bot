import Normalize from "@root/src/common/migration/Normalize";
import { playerEmojisEmojis } from "../schema/schema";
import Stumper from "stumper";

interface IRawPlayerEmojiRecord {
  id: string;
  data: string;
}

export default class PlayerEmojisNormalize extends Normalize {
  constructor() {
    super("PlayerEmojis");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_player-emojis", this.migratePlayerEmojis.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    return this.validateCounts([
      {
        rawTableName: "raw_player-emojis",
        normalizedTable: playerEmojisEmojis,
      },
    ]);
  }

  private async migratePlayerEmojis(): Promise<number> {
    const rawPlayerEmojis = (await this.getRawTableData("raw_player-emojis")) as IRawPlayerEmojiRecord[];

    if (rawPlayerEmojis.length === 0) {
      Stumper.warning("No player emojis to migrate", "PlayerEmojis:Migration:PlayerEmojis");
      return 0;
    }

    let migratedCount = 0;

    for (const rawPlayerEmojiRecord of rawPlayerEmojis) {
      if (isNaN(parseInt(rawPlayerEmojiRecord.id))) {
        Stumper.error(`Player emoji record ${rawPlayerEmojiRecord.id} is not a number`, "PlayerEmojis:Migration:PlayerEmojis");
        continue;
      }

      try {
        await this.db
          .insert(playerEmojisEmojis)
          .values({
            playerId: parseInt(rawPlayerEmojiRecord.id),
            emojiId: rawPlayerEmojiRecord.data,
          })
          .onConflictDoUpdate({
            target: playerEmojisEmojis.playerId,
            set: {
              emojiId: rawPlayerEmojiRecord.data,
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated player emoji record: ${rawPlayerEmojiRecord.id}`, "PlayerEmojis:Migration:PlayerEmojis");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate player emoji record ${rawPlayerEmojiRecord.id}: ${errorMessage}`, "PlayerEmojis:Migration:PlayerEmojis");
      }
    }

    return migratedCount;
  }
}
