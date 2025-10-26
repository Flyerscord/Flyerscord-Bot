import Normalize from "@root/src/common/migration/Normalize";
import { customCommandsCommands, customCommandsHistory } from "../schema/schema";
import Stumper from "stumper";

interface IRawCommandRecord {
  id: string;
  data: IRawCommand;
}

interface IRawCommand {
  name: string;
  text: string;
  history: IRawCustomCommandHistory[];
  createdBy: string;
  createdOn: Date;
}

interface IRawCustomCommandHistory {
  oldText: string;
  newText: string;
  editedOn: Date;
  editedBy: string;
  index: number;
}

export default class CustomCommandsNormalize extends Normalize {
  constructor() {
    super("CustomCommands");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_custom-commands", this.migrateCommands.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    const commandCountResult = await this.validateCounts([
      {
        rawTableName: "raw_custom-commands",
        normalizedTable: customCommandsCommands,
      },
    ]);

    if (!commandCountResult) {
      return false;
    }

    let rawHistoryCount = 0;

    const rawCommands = (await this.getRawTableData("raw_custom-commands")) as IRawCommandRecord[];
    for (const rawCommand of rawCommands) {
      rawHistoryCount += rawCommand.data.history.length;
    }

    const historyCount = await this.getNormalizedTableCount(customCommandsHistory);

    if (rawHistoryCount !== historyCount) {
      Stumper.error(
        `Raw history count ${rawHistoryCount} does not match normalized history count ${historyCount}`,
        "CustomCommands:Normalize:validate",
      );
      return false;
    }

    return true;
  }

  private async migrateCommands(): Promise<number> {
    const rawCommands = (await this.getRawTableData("raw_custom-commands")) as IRawCommandRecord[];

    if (rawCommands.length === 0) {
      Stumper.warning("No commands to migrate", "CustomCommands:Migration:Commands");
      return 0;
    }

    let migratedCount = 0;

    for (const rawCommand of rawCommands) {
      let insertedCommandId: number | undefined;

      try {
        const result = await this.db
          .insert(customCommandsCommands)
          .values({
            name: rawCommand.data.name,
            text: rawCommand.data.text,
            createdBy: rawCommand.data.createdBy,
            createdOn: rawCommand.data.createdOn,
          })
          .onConflictDoUpdate({
            target: customCommandsCommands.name,
            set: {
              text: rawCommand.data.text,
              createdBy: rawCommand.data.createdBy,
              createdOn: rawCommand.data.createdOn,
            },
          })
          .returning({ id: customCommandsCommands.id });

        insertedCommandId = result[0]?.id;
        migratedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate command ${rawCommand.id}: ${errorMessage}`, "CustomCommands:Migration:Commands");
        continue; // Skip history if command failed
      }

      if (!insertedCommandId) {
        Stumper.error(`No ID returned for command ${rawCommand.data.name}`, "CustomCommands:Migration:Commands");
        continue;
      }

      if (rawCommand.data.history.length > 0) {
        for (const rawHistory of rawCommand.data.history) {
          try {
            await this.db.insert(customCommandsHistory).values({
              commandId: insertedCommandId,
              oldText: rawHistory.oldText,
              newText: rawHistory.newText,
              editedBy: rawHistory.editedBy,
              editedOn: rawHistory.editedOn,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            Stumper.error(`Failed to migrate history record ${rawHistory.index}: ${errorMessage}`, "CustomCommands:Migration:History");
          }
        }
      }
    }

    return migratedCount;
  }
}
