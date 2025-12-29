import SchemaManager from "@common/managers/SchemaManager";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import { TableEnumRecord } from "./schema-types";

// Get dotenv variables
dotenv.config();

export type PostgresDB = ReturnType<typeof drizzlePostgres<TableEnumRecord>>;

export function getDb(): PostgresDB {
  const connectionString = process.env.DATABASE_URL_POOLED;

  if (!connectionString) {
    throw new Error("DATABASE_URL_POOLED is not set");
  }

  const schema = SchemaManager.getInstance().getSchema();

  const postgresClient = postgres(connectionString);
  return drizzlePostgres(postgresClient, { schema });
}
