import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/**/schema/schema.ts", // Glob pattern to find all schemas
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_SINGLE!,
  },
});
