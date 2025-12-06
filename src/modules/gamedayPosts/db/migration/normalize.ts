import Normalize from "@root/src/common/migration/Normalize";
import { gamedayPostsPosts } from "../schema";
import Stumper from "stumper";

interface IRawGamedayPostsRecord {
  id: string;
  data: IRawGamedayPosts;
}

interface IRawGamedayPosts {
  gameId: number;
  channelId: string;
}

export default class GamedayPostsNormalize extends Normalize {
  constructor() {
    super("GameDayPosts");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_game-day-posts", this.migrateGamedayPosts.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    return this.validateCounts([
      {
        rawTableName: "raw_game-day-posts",
        normalizedTable: gamedayPostsPosts,
      },
    ]);
  }

  private async migrateGamedayPosts(): Promise<number> {
    const rawGamedayPosts = await this.getRawTableData<IRawGamedayPostsRecord>("raw_game-day-posts");

    if (rawGamedayPosts.length === 0) {
      Stumper.warning("No gameday posts to migrate", "GamedayPosts:Migration:GamedayPosts");
      return 0;
    }

    let migratedCount = 0;

    for (const rawGamedayPostsRecord of rawGamedayPosts) {
      try {
        await this.db
          .insert(gamedayPostsPosts)
          .values({
            gameId: rawGamedayPostsRecord.data.gameId,
            channelId: rawGamedayPostsRecord.data.channelId,
          })
          .onConflictDoUpdate({
            target: gamedayPostsPosts.gameId,
            set: {
              channelId: rawGamedayPostsRecord.data.channelId,
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated gameday post record: ${rawGamedayPostsRecord.id}`, "GamedayPosts:Migration:GamedayPosts");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate gameday post record ${rawGamedayPostsRecord.id}: ${errorMessage}`, "GamedayPosts:Migration:GamedayPosts");
      }
    }
    return migratedCount;
  }
}
