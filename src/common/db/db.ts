import SchemaManager from "@common/managers/SchemaManager";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import { TableEnumRecord } from "./schema-types";
import Stumper from "stumper";

// Get dotenv variables
dotenv.config();

export type NeonDB = NeonHttpDatabase<TableEnumRecord> & {
  $client: NeonQueryFunction<false, false>;
};

export type PostgresDB = ReturnType<typeof drizzlePostgres<TableEnumRecord>>;

export type DB = NeonDB | PostgresDB;

export function getDb(): DB {
  const connectionString = process.env.DATABASE_URL_POOLED;

  if (!connectionString) {
    throw new Error("DATABASE_URL_POOLED is not set");
  }

  const schema = SchemaManager.getInstance().getSchema();

  // Detect if using Neon (websocket) or standard PostgreSQL
  const isNeon = connectionString.includes("neon.tech");

  if (isNeon) {
    const neonDb = neon(connectionString);
    return drizzleNeon(neonDb, { schema });
  } else {
    const postgresClient = postgres(connectionString);
    return drizzlePostgres(postgresClient, { schema });
  }
}
