import SchemaManager from "@common/managers/SchemaManager";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import { TableEnumRecord } from "./schema-types";
import { Singleton } from "../models/Singleton";
import Stumper from "stumper";
import EnvManager from "../managers/EnvManager";

// Get dotenv variables
dotenv.config();

export type PostgresDB = ReturnType<typeof drizzlePostgres<TableEnumRecord>>;

export default class Database extends Singleton {
  private db: PostgresDB | null;
  private connectionString: string;
  private client: postgres.Sql<{}>;

  private maxConnections = 150;

  constructor() {
    super();

    const DATABASE_URL_POOLED = EnvManager.getInstance().get("DATABASE_URL_POOLED");
    if (!DATABASE_URL_POOLED) {
      throw new Error("DATABASE_URL_POOLED is not set");
    }
    this.connectionString = DATABASE_URL_POOLED;

    const schema = SchemaManager.getInstance().getSchema();

    this.client = postgres(this.connectionString, {
      max: this.maxConnections,
      idle_timeout: 30,
      connect_timeout: 10,
      max_lifetime: 60 * 30,
      onnotice: () => {}, // Suppress notices
    });
    this.db = drizzlePostgres(this.client, { schema });
  }

  getDb(): PostgresDB {
    if (!this.db) {
      Stumper.error("Database is closed!", "Common::Database::getDb");
      throw new Error("Database is closed!");
    }
    return this.db;
  }

  async closeDb(): Promise<void> {
    await this.client.end();
    this.db = null;
  }
}
