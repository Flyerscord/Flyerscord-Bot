import SchemaManager from "@common/managers/SchemaManager";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import dotenv from "dotenv";
import { TableEnumRecord } from "./schema-types";

// Get dotenv variables
dotenv.config();

export type NeonDB = NeonHttpDatabase<TableEnumRecord> & {
  $client: NeonQueryFunction<false, false>;
};

export function getDb(): NeonDB {
  const connectionString = process.env.DATABASE_URL_POOLED;

  if (!connectionString) {
    throw new Error("DATABASE_URL_POOLED is not set");
  }

  const neonDb = neon(connectionString);

  return drizzle(neonDb, {
    schema: SchemaManager.getInstance().getSchema(),
  });
}
