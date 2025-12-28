import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL_SINGLE!;

// Detect if using Neon (websocket) or standard PostgreSQL
const isNeon = databaseUrl.includes("neon.tech");

export default defineConfig({
  schema: "./src/**/db/schema.ts", // Glob pattern to find all schemas
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  ...(isNeon ? {} : { driver: "pglite" }),
});
