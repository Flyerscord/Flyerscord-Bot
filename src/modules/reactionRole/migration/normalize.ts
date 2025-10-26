import Normalize from "@root/src/common/migration/Normalize";
import { reactionRoleMessages } from "../schema/schema";
import Stumper from "stumper";

interface IRawReactionRoleRecord {
  id: string;
  data: string;
}

export default class ReactionRoleNormalize extends Normalize {
  constructor() {
    super("ReactionRole");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_reaction-message", this.migrateReactionRole.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    return this.validateCounts([
      {
        rawTableName: "raw_reaction-message",
        normalizedTable: reactionRoleMessages,
      },
    ]);
  }

  private async migrateReactionRole(): Promise<number> {
    const rawReactionRoles = (await this.getRawTableData("raw_reaction-message")) as IRawReactionRoleRecord[];

    if (rawReactionRoles.length === 0) {
      return 0;
    }

    let migratedCount = 0;

    for (const rawReactionRoleRecord of rawReactionRoles) {
      try {
        await this.db
          .insert(reactionRoleMessages)
          .values({
            name: rawReactionRoleRecord.id,
            messageId: rawReactionRoleRecord.data,
          })
          .onConflictDoUpdate({
            target: reactionRoleMessages.name,
            set: {
              messageId: rawReactionRoleRecord.data,
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated reaction role record: ${rawReactionRoleRecord.id}`, "ReactionRole:Migration:ReactionRole");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate reaction role record ${rawReactionRoleRecord.id}: ${errorMessage}`, "ReactionRole:Migration:ReactionRole");
      }
    }

    return migratedCount;
  }
}
