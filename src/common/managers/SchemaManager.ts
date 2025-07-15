import { Singleton } from "@common/models/Singleton";
import { PgTable } from "drizzle-orm/pg-core";
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
}
