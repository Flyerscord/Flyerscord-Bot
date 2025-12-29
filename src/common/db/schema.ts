import { index, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createModuleEnum, createModuleTable } from "./schema-types";
import type { Modules } from "@modules/Modules";

export enum AuditLogSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export const severityEnum = createModuleEnum("common__audit_log_severity_type", AuditLogSeverity);

export const auditLog = createModuleTable(
  "common__audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    moduleName: text("module_name").notNull().$type<Modules>(),
    action: text("action").notNull(),
    userId: text("user_id"),
    details: jsonb("details"),
    severity: severityEnum("severity").notNull().default(AuditLogSeverity.INFO),
  },
  (table) => [
    // Indexes for common query patterns
    index("audit_log_module_name_idx").on(table.moduleName),
    index("audit_log_timestamp_idx").on(table.timestamp),
    index("audit_log_user_id_idx").on(table.userId),

    // Composite index for common filtered queries
    index("audit_log_module_timestamp_idx").on(table.moduleName, table.timestamp),
  ],
);

export const config = createModuleTable("common__config", {});

export default {
  severityEnum,
  auditLog,
};

export type AuditLog = typeof auditLog.$inferSelect;

export type NewAuditLog = Omit<typeof auditLog.$inferInsert, "id">;
