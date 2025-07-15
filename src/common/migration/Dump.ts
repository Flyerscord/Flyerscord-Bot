import Database from "@common/providers/Database";
import { Pool } from "@neondatabase/serverless";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTable } from "drizzle-orm/pg-core";

export default class Dump<T extends Database> {
  private enmapDb: T;
  private pgTable: PgTable;

  constructor(enmapDb: T, pgTable: PgTable) {
    this.enmapDb = enmapDb;
    this.pgTable = pgTable;
  }

  async dumpEnmapToRaw(
    db: NodePgDatabase<Record<string, never>> & {
      $client: Pool;
    },
  ): Promise<void> {
    const entries = this.enmapDb.getEntries();

    for (const [id, value] of entries) {
      await db
        .insert(this.pgTable)
        .values({ id, data: value })
        .onConflictDoUpdate({ target: this.pgTable.id, set: { data: value } });
    }
  }
}
