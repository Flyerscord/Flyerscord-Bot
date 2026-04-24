// Defined locally to avoid pulling in bot's full transitive import chain.
// Must match the DB schema exactly — mirror any bot schema changes here.
import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const levels = pgTable(
  "levels__levels",
  {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    totalExperience: integer("total_experience").notNull().default(0),
    currentLevel: integer("current_level").notNull().default(0),
    messageCount: integer("message_count").notNull().default(0),
    timeOfLastMessage: timestamp("time_of_last_message").notNull(),
  },
  (table) => [index("levels_total_experience_idx").on(table.totalExperience)],
);

export const auditLogSeverity = pgEnum("common__audit_log_severity_type_type", ["INFO", "WARNING", "CRITICAL", "ERROR"]);

export const auditLogEntries = pgTable(
  "common__audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    moduleName: text("module_name").notNull(),
    action: text("action").notNull(),
    userId: text("user_id"),
    details: jsonb("details"),
    severity: auditLogSeverity("severity").notNull().default("INFO"),
  },
  (table) => [index("audit_log_timestamp_idx").on(table.timestamp)],
);

export type LevelsEntry = typeof levels.$inferSelect;
export type AuditLogEntry = typeof auditLogEntries.$inferSelect;
