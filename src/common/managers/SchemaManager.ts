import { Singleton } from "@common/models/Singleton";
import { PgTable, pgTable, varchar, jsonb } from "drizzle-orm/pg-core";
import Stumper from "stumper";

export default class SchemaManager extends Singleton {
  private tables: Record<string, PgTable> = {};

  constructor() {
    super();
  }

  register(tables: Record<string, PgTable>): boolean {
    for (const [key, table] of Object.entries(tables)) {
      if (this.tables[key]) {
        Stumper.error(`Table ${key} already registered!`, "SchemaManager:register");
        return false;
      }
      this.tables[key] = table;
    }
    return true;
  }

  getSchema(): Record<string, PgTable> {
    return this.tables;
  }

  createRawTable(plainName: string): PgTable {
    return pgTable(`raw_${plainName}`, {
      id: varchar("id", { length: 32 }).primaryKey(),
      data: jsonb("data").notNull(),
    });
  }

  registerRawTables(tableNames: string[]): boolean {
    const rawTables: Record<string, PgTable> = {};

    for (const tableName of tableNames) {
      const rawTableName = `raw_${tableName}`;

      if (this.tables[rawTableName]) {
        Stumper.error(`Raw table ${rawTableName} already registered!`, "SchemaManager:registerRawTables");
        return false;
      }

      rawTables[rawTableName] = this.createRawTable(tableName);
      Stumper.info(`Generated raw table schema for: ${rawTableName}`, "SchemaManager:registerRawTables");
    }

    return this.register(rawTables);
  }
}
