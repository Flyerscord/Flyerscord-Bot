import Normalize from "@common/migration/Normalize";
import { customCommandsCommands, customCommandsState } from "../schema";
import Stumper from "stumper";
import { auditLog } from "@common/db/schema";
import { CustomCommandsActionType, IAuditLogInfo } from "../CustomCommandsDB";

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

interface IRawGlobalRecord {
  id: string;
  data: unknown;
}

export default class CustomCommandsNormalize extends Normalize {
  constructor() {
    super("CustomCommands");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_custom-commands", this.migrateCommands.bind(this));
    await this.runMigration("raw_global", this.migrateGlobal.bind(this));
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

    const rawCommands = await this.getRawTableData<IRawCommandRecord>("raw_custom-commands");
    for (const rawCommand of rawCommands) {
      // Increment for the command add
      rawHistoryCount++;
      // Add the edit ammount to the history count
      rawHistoryCount += rawCommand.data.history.length;
    }

    const historyCount = await this.getCountAuditLogs();

    if (rawHistoryCount !== historyCount) {
      Stumper.error(`Raw history count ${rawHistoryCount} does not match audit log count ${historyCount}`, "CustomCommands:Normalize:validate");
      return false;
    }

    const stateCount = await this.getNormalizedTableCount(customCommandsState);
    if (stateCount !== 1) {
      Stumper.error(`State count ${stateCount} does not match expected count 1`, "CustomCommands:Normalize:validate");
      return false;
    }

    return true;
  }

  private async migrateCommands(): Promise<number> {
    const rawCommands = await this.getRawTableData<IRawCommandRecord>("raw_custom-commands");

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

        // Add the command add to the audit log
        const auditLogInfo: IAuditLogInfo = {
          oldText: "",
          newText: rawCommand.data.text,
          commandName: rawCommand.data.name,
          commandId: insertedCommandId,
        };

        await this.db.insert(auditLog).values({
          timestamp: rawCommand.data.createdOn,
          moduleName: "CustomCommands",
          action: CustomCommandsActionType.ADD,
          userId: rawCommand.data.createdBy,
          details: auditLogInfo,
        });

        migratedCount++;
        Stumper.debug(`Migrated command: ${rawCommand.id} = ${rawCommand.data.name}`, "CustomCommands:Migration:Commands");
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
            const auditLogInfo: IAuditLogInfo = {
              oldText: rawHistory.oldText,
              newText: rawHistory.newText,
              commandName: rawCommand.data.name,
              commandId: insertedCommandId,
            };

            await this.db.insert(auditLog).values({
              timestamp: rawHistory.editedOn,
              moduleName: "CustomCommands",
              action: CustomCommandsActionType.EDIT,
              userId: rawHistory.editedBy,
              details: auditLogInfo,
            });

            Stumper.debug(`Migrated history record: ${rawHistory.index}`, "CustomCommands:Migration:History");
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            Stumper.error(`Failed to migrate history record ${rawHistory.index}: ${errorMessage}`, "CustomCommands:Migration:History");
          }
        }
      }
    }

    return migratedCount;
  }

  private async migrateGlobal(): Promise<number> {
    const rawGlobal = await this.getRawTableData<IRawGlobalRecord>("raw_global");

    if (rawGlobal.length === 0) {
      Stumper.warning("No global to migrate", "CustomCommands:Migration:Global");
      return 0;
    }

    let migratedCount = 0;

    for (const rawGlobalRecord of rawGlobal) {
      if (rawGlobalRecord.id !== "commandListMessageId") {
        Stumper.debug(
          `Skipping global record: ${rawGlobalRecord.id}. This row is not being moved into this module.`,
          "CustomCommands:Migration:Global",
        );
        continue;
      }

      if (!this.isStringArray(rawGlobalRecord.data)) {
        Stumper.error(`Global record ${rawGlobalRecord.id} is not an array of strings`, "CustomCommands:Migration:Global");
        return migratedCount;
      }

      try {
        await this.db
          .insert(customCommandsState)
          .values({
            key: rawGlobalRecord.id,
            messageIds: rawGlobalRecord.data,
          })
          .onConflictDoUpdate({
            target: customCommandsState.key,
            set: {
              messageIds: rawGlobalRecord.data,
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated global record: ${rawGlobalRecord.id}`, "CustomCommands:Migration:Global");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate global record ${rawGlobalRecord.id}: ${errorMessage}`, "CustomCommands:Migration:Global");
      }
    }
    return migratedCount;
  }
}
