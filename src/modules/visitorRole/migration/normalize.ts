import Normalize from "@root/src/common/migration/Normalize";
import { visitorRoleState } from "../schema/schema";
import Stumper from "stumper";

interface IRawGlobalRecord {
  id: string;
  data: unknown;
}

export default class VisitorRoleNormalize extends Normalize {
  constructor() {
    super("VisitorRole");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_global", this.migrateState.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    const normalizedCount = await this.getNormalizedTableCount(visitorRoleState);

    if (normalizedCount !== 1) {
      Stumper.error(`State count ${normalizedCount} does not match expected count 1`, "VisitorRole:Migration:validate");
      return false;
    }

    return true;
  }

  protected async migrateState(): Promise<number> {
    const rawGlobal = (await this.getRawTableData("raw_global")) as IRawGlobalRecord[];

    if (rawGlobal.length === 0) {
      Stumper.warning("No global to migrate", "VisitorRole:Migration:State");
      return 0;
    }

    let migratedCount = 0;

    for (const rawGlobalRecord of rawGlobal) {
      if (rawGlobalRecord.id !== "visitorRoleMessageId") {
        Stumper.debug(`Skipping global record: ${rawGlobalRecord.id}. This row is not being moved into this module.`, "VisitorRole:Migration:State");
        continue;
      }

      if (typeof rawGlobalRecord.data !== "string") {
        Stumper.error(`Global record ${rawGlobalRecord.id} is not a string`, "VisitorRole:Migration:State");
        return migratedCount;
      }

      try {
        await this.db
          .insert(visitorRoleState)
          .values({
            key: rawGlobalRecord.id,
            value: rawGlobalRecord.data,
          })
          .onConflictDoUpdate({
            target: visitorRoleState.key,
            set: {
              value: rawGlobalRecord.data,
            },
          });
        migratedCount++;
        Stumper.debug(`Migrated global record: ${rawGlobalRecord.id}`, "VisitorRole:Migration:State");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Stumper.error(`Failed to migrate global record ${rawGlobalRecord.id}: ${errorMessage}`, "VisitorRole:Migration:State");
      }
    }
    return migratedCount;
  }
}
