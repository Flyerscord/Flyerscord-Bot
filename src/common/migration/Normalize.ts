import { PgTableWithColumns } from "drizzle-orm/pg-core";
import { getDb, NeonDB } from "../db/db";
import { count } from "drizzle-orm";
import Stumper from "stumper";
import SchemaManager from "../managers/SchemaManager";

export interface IValidateInput {
  rawTableName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  normalizedTable: PgTableWithColumns<any>;
}

export interface IRawData {
  id: string;
  data: unknown;
}

export default abstract class Normalize {
  protected readonly db: NeonDB;

  protected readonly moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;

    this.db = getDb(false);
  }

  abstract normalize(): Promise<void>;

  abstract validate(): Promise<boolean>;

  protected async getRawTableData(tableName: string): Promise<IRawData[]> {
    const schemaManager = SchemaManager.getInstance();
    const rawTable = schemaManager.createRawTable(tableName);
    const data = await this.db.select().from(rawTable);
    return data as IRawData[];
  }

  protected async runMigration(tableName: string, migrateFunc: () => Promise<number>): Promise<void> {
    Stumper.info(`Migrating ${tableName}...`, `${this.moduleName}:Migration:Normalize:${migrateFunc.name}`);

    const migratedCount = await migrateFunc();

    Stumper.info(`Migrated ${migratedCount} row(s) for ${tableName}`, `${this.moduleName}:Migration:Normalize:${migrateFunc.name}`);
  }

  protected async getRawTableCount(tableName: string): Promise<number> {
    const schemaManager = SchemaManager.getInstance();
    const rawTable = schemaManager.createRawTable(tableName);
    const result = await this.db.select({ count: count() }).from(rawTable);
    return result[0].count;
  }

  protected async validateCounts(tables: IValidateInput[]): Promise<boolean> {
    const counts = await Promise.all(
      tables.map(async (table) => {
        const rawCount = await this.getRawTableCount(table.rawTableName);
        const normalizedCount = await this.db.select({ count: count() }).from(table.normalizedTable);
        return { table, rawCount, normalizedCount: normalizedCount[0].count };
      }),
    );

    const result = counts.every((count) => {
      if (count.rawCount === count.normalizedCount) {
        Stumper.info(
          `Raw table ${count.table.rawTableName} and normalized table ${count.table.normalizedTable._.name} match`,
          "Normalize:Validation",
        );
        return true;
      }
      Stumper.error(
        `Raw table ${count.table.rawTableName} and normalized table ${count.table.normalizedTable._.name} do not match`,
        "Normalize:Validation",
      );
      return false;
    });

    if (result) {
      Stumper.info(`Module ${this.moduleName} normalization validation: PASSED`, "Normalize:Validation");
      return true;
    }

    Stumper.error(`Module ${this.moduleName} normalization validation: FAILED`, "Normalize:Validation");
    return false;
  }
}
