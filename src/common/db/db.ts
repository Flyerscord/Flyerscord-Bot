import SchemaManager from "@common/managers/SchemaManager";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { PgTable, TableConfig } from "drizzle-orm/pg-core";
import dotenv from "dotenv";

// Get dotenv variables
dotenv.config();

export type NeonDB = NeonHttpDatabase<Record<string, PgTable<TableConfig>>> & {
  $client: NeonQueryFunction<false, false>;
};

export function getDb(pooled = true): NeonDB {
  let connectionString;
  if (pooled) {
    connectionString = process.env.DATABASE_URL_POOLED || "";
  } else {
    connectionString = process.env.DATABASE_URL_SINGLE || "";
  }

  if (connectionString === "") {
    throw new Error("DATABASE_URL_SINGLE or DATABASE_URL_POOLED is not set");
  }

  const neonDb = neon(connectionString);

  return drizzle(neonDb, {
    schema: SchemaManager.getInstance().getSchema(),
  });
}
