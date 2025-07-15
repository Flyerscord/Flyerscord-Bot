import { jsonb, pgTable, PgTable, varchar } from "drizzle-orm/pg-core";

export function createRawTable(plainName: string): PgTable {
  return pgTable(`raw_${plainName}`, {
    id: varchar("id", { length: 32 }).primaryKey(),
    data: jsonb("data").notNull(),
  });
}
