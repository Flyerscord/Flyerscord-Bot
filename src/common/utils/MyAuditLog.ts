import { Modules } from "@modules/Modules";
import Database from "../db/db";
import { AuditLog, auditLog, NewAuditLog } from "../db/schema";
import { count, eq, and } from "drizzle-orm";
import Stumper from "stumper";

export default class MyAuditLog {
  /**
   * Creates a new entry to the audit log, current timestamp will be used
   * @param moduleName - The name of the module adding the audit log
   * @param newAuditLog - The audit log entry to insert
   * @param suppressErrors - If true (default), errors will be caught and logged. If false, errors will be thrown.
   */
  static async createAuditLog(
    moduleName: Modules,
    newAuditLog: Omit<NewAuditLog, "timestamp" | "moduleName">,
    suppressErrors: boolean = true,
  ): Promise<void> {
    const db = Database.getInstance().getDb();
    const insertAuditLog = async (): Promise<void> => {
      const newAuditLogWithModuleName: NewAuditLog = {
        ...newAuditLog,
        moduleName,
      };
      await db.insert(auditLog).values(newAuditLogWithModuleName);
    };

    if (suppressErrors) {
      try {
        await insertAuditLog();
      } catch (error) {
        Stumper.error(`Failed to create audit log: ${error}`, `Common::MyAuditLog::createAuditLog`);
      }
    } else {
      await insertAuditLog();
    }
  }

  /**
   * Gets the total count of audit logs for this module
   * @param moduleName - The name of the module to get the count for
   * @returns The number of audit log entries for this module
   */
  static async getCountAuditLogs(moduleName: Modules): Promise<number> {
    const db = Database.getInstance().getDb();
    const result = await db.select({ count: count() }).from(auditLog).where(eq(auditLog.moduleName, moduleName));
    return result[0]?.count ?? 0;
  }

  /**
   * Retrieves audit logs for this module
   * @param moduleName - The name of the module to get the logs for
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries
   */
  static async getAuditLogs(moduleName: Modules, limit: number = Infinity): Promise<AuditLog[]> {
    const db = Database.getInstance().getDb();
    if (limit === Infinity) {
      return await db.select().from(auditLog).where(eq(auditLog.moduleName, moduleName));
    }
    return await db.select().from(auditLog).where(eq(auditLog.moduleName, moduleName)).limit(limit);
  }

  /**
   * Retrieves audit logs for this module filtered by action type
   * @param moduleName - The name of the module to get the logs for
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries matching the action
   */
  static async getAuditLogsByAction(moduleName: Modules, action: string, limit: number = Infinity): Promise<AuditLog[]> {
    const db = Database.getInstance().getDb();
    if (limit === Infinity) {
      return await db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.action, action)));
    }
    return await db
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
    const db = Database.getInstance().getDb();
    if (limit === Infinity) {
      return await db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.userId, userId)));
    }
    return await db
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
    const db = Database.getInstance().getDb();
    if (limit === Infinity) {
      return await db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, moduleName), eq(auditLog.userId, userId), eq(auditLog.action, action)));
    }
    return await db
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
    const db = Database.getInstance().getDb();
    return (await db.select().from(auditLog).where(eq(auditLog.id, id)).limit(1))[0];
  }
}
