import { PgTable } from "drizzle-orm/pg-core";
import { getDb, NeonDB } from "../db/db";
import { count, eq } from "drizzle-orm";
import { getTableName } from "drizzle-orm";
import Stumper from "stumper";
import SchemaManager from "../managers/SchemaManager";

export interface IValidateInput {
  rawTableName: string;
  normalizedTable: PgTable;
}

export default abstract class Normalize {
  protected readonly db: NeonDB;

  protected readonly moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;

    this.db = getDb(false);
  }

  abstract normalize(): Promise<void>;

  protected abstract runValidation(): Promise<boolean>;

  async validate(): Promise<boolean> {
    Stumper.info(`Starting validation for ${this.moduleName}`, "Normalize:validate");
    const result = await this.runValidation();
    if (!result) {
      Stumper.error(`Validation failed for ${this.moduleName}`, "Normalize:validate");
      return false;
    }
    Stumper.success(`Validation passed for ${this.moduleName}`, "Normalize:validate");
    return true;
  }

  protected async getRawTableData<T>(tableName: string): Promise<T[]> {
    const strippedTableName = tableName.replace("raw_", "");
    const schemaManager = SchemaManager.getInstance();
    const rawTable = schemaManager.createRawTable(strippedTableName);
    const data = await this.db.select().from(rawTable);
    return data as T[];
  }

  protected async getRawTableRow<T>(tableName: string, id: string): Promise<T | undefined> {
    const strippedTableName = tableName.replace("raw_", "");
    const schemaManager = SchemaManager.getInstance();
    const rawTable = schemaManager.createRawTable(strippedTableName);
    const data = await this.db.select().from(rawTable).where(eq(rawTable.id, id));
    return data[0] as T;
  }

  protected async runMigration(tableName: string, migrateFunc: () => Promise<number>): Promise<void> {
    Stumper.info(`Migrating ${tableName}...`, `${this.moduleName}:Migration:Normalize:${migrateFunc.name}`);

    const migratedCount = await migrateFunc();

    Stumper.info(`Migrated ${migratedCount} row(s) for ${tableName}`, `${this.moduleName}:Migration:Normalize:${migrateFunc.name}`);
  }

  protected async getNormalizedTableCount(table: PgTable): Promise<number> {
    return (await this.db.select({ count: count() }).from(table))[0].count;
  }

  protected async getRawTableCount(tableName: string): Promise<number> {
    const strippedTableName = tableName.replace("raw_", "");
    const schemaManager = SchemaManager.getInstance();
    const rawTable = schemaManager.createRawTable(strippedTableName);
    return await this.getNormalizedTableCount(rawTable);
  }

  protected async validateCounts(tables: IValidateInput[]): Promise<boolean> {
    const counts = await Promise.all(
      tables.map(async (table) => {
        const rawCount = await this.getRawTableCount(table.rawTableName);
        const normalizedCount = await this.getNormalizedTableCount(table.normalizedTable);
        return { table, rawCount, normalizedCount };
      }),
    );

    const result = counts.every((count) => {
      const normalizedTableName = getTableName(count.table.normalizedTable);
      if (count.rawCount === count.normalizedCount) {
        Stumper.info(`Raw table ${count.table.rawTableName} and normalized table ${normalizedTableName} match`, "Normalize:Validation");
        return true;
      }
      Stumper.error(`Raw table ${count.table.rawTableName} and normalized table ${normalizedTableName} do not match`, "Normalize:Validation");
      return false;
    });

    return result;
  }

  protected isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
  }
}
