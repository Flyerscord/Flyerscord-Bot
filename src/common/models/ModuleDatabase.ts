import { Modules } from "@modules/Modules";
import { getDb, NeonDB } from "../db/db";
import { PgTable } from "drizzle-orm/pg-core";
import { count } from "drizzle-orm";

export abstract class ModuleDatabase {
  protected readonly db: NeonDB;
  protected readonly moduleName: Modules;

  constructor(moduleName: Modules) {
    this.moduleName = moduleName;
    this.db = getDb();
  }

  // TODO: Add common methods
  protected async getRowsCount(table: PgTable): Promise<number> {
    return (await this.db.select({ count: count() }).from(table))[0].count;
  }
}
