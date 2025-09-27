import Database from "@common/providers/Database";
import { PgTable } from "drizzle-orm/pg-core";
import SchemaManager from "@common/managers/SchemaManager";
import type { NeonDB } from "../db/db";

export default class Dump<T extends Database> {
  private enmapDb: T;
  private pgTable: PgTable;

  constructor(enmapDb: T) {
    this.enmapDb = enmapDb;
    const schemaManager = SchemaManager.getInstance();
    this.pgTable = schemaManager.createRawTable(enmapDb.getName());
  }

  async dumpEnmapToRaw(db: NeonDB): Promise<void> {
    const entries = this.enmapDb.getEntries();

    for (const [id, value] of entries) {
      await db
        .insert(this.pgTable)
        .values({ id, data: value })
        .onConflictDoUpdate({ target: (this.pgTable as any).id, set: { data: value } });
    }
  }
}
