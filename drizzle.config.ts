import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/**/db/schema.ts", // Glob pattern to find all schemas
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_SINGLE!,
  },
  migrations: {
    schema: "public",
  },
});
