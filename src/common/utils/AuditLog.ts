import { Modules } from "@root/src/modules/Modules";
import Database from "../db/db";
import { AuditLog, auditLog, NewAuditLog } from "../db/schema";
import { count, eq, and } from "drizzle-orm";

export default class MyAuditLog {
  static db = Database.getInstance().getDb();

  /**
   * Creates a new entry to the audit log, current timestamp will be used
   * @param moduleName - The name of the module adding the audit log
   * @param newAuditLog - The audit log entry to insert
   */
  static async createAuditLog(moduleName: Modules, newAuditLog: Omit<NewAuditLog, "timestamp" | "moduleName">): Promise<void> {
    const newAuditLogWithModuleName: NewAuditLog = {
      ...newAuditLog,
      moduleName,
    };
    await this.db.insert(auditLog).values(newAuditLogWithModuleName);
  }

  /**
   * Creates a new entry to the audit log with a timestamp
   * @param moduleName - The name of the module adding the audit log
   * @param newAuditLog - The audit log entry to insert
   */
  static async createAuditLogWithDate(moduleName: Modules, newAuditLog: Omit<NewAuditLog, "moduleName">): Promise<void> {
    const newAuditLogWithModuleName: NewAuditLog = {
      ...newAuditLog,
      moduleName,
    };
    await this.db.insert(auditLog).values(newAuditLogWithModuleName);
  }

  /**
   * Gets the total count of audit logs for this module
   * @param moduleName - The name of the module to get the count for
   * @returns The number of audit log entries for this module
   */
  static async getCountAuditLogs(moduleName: Modules): Promise<number> {
    const result = await this.db.select({ count: count() }).from(auditLog).where(eq(auditLog.moduleName, moduleName));
    return result[0]?.count ?? 0;
  }

  /**
   * Retrieves audit logs for this module
   * @param moduleName - The name of the module to get the logs for
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries
   */
  static async getAuditLogs(moduleName: Modules, limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db.select().from(auditLog).where(eq(auditLog.moduleName, moduleName));
    }
    return await this.db.select().from(auditLog).where(eq(auditLog.moduleName, moduleName)).limit(limit);
  }

  /**
   * Retrieves audit logs for this module filtered by action type
   * @param moduleName - The name of the module to get the logs for
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries matching the action
   */
  static async getAuditLogsByAction(moduleName: Modules, action: string, limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.action, action)));
    }
    return await this.db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.action, action)))
      .limit(limit);
  }

  /**
   * Retrieves audit logs for this module filtered by user ID
   * @param userId - The Discord user ID to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries for the specified user
   */
  static async getAuditLogsByUser(moduleName: Modules, userId: string, limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.userId, userId)));
    }
    return await this.db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.userId, userId)))
      .limit(limit);
  }

  /**
   * Retrieves audit logs for this module filtered by both user ID and action type
   * @param moduleName - The name of the module to get the logs for
   * @param userId - The Discord user ID to filter by
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries matching both user and action
   */
  static async getAuditLogsByUserAndAction(moduleName: Modules, userId: string, action: string, limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.userId, userId), eq(auditLog.action, action)));
    }
    return await this.db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.userId, userId), eq(auditLog.action, action)))
      .limit(limit);
  }

  /**
   * Retrieves a specific audit log entry by ID
   * @param id - The unique identifier of the audit log entry
   * @returns The audit log entry if found, undefined otherwise
   */
  static async getAuditLog(id: string): Promise<AuditLog | undefined> {
    return (await this.db.select().from(auditLog).where(eq(auditLog.id, id)).limit(1))[0];
  }
}
