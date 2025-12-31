import { Modules } from "@modules/Modules";
import Database, { PostgresDB } from "../db/db";
import { PgTable } from "drizzle-orm/pg-core";
import { count, eq, and, sql, SQL } from "drizzle-orm";
import { AuditLog, auditLog, NewAuditLog } from "../db/schema";

export abstract class ModuleDatabase {
  protected readonly db: PostgresDB;
  protected readonly moduleName: Modules;

  /**
   * Constructor for ModuleDatabase base class
   * @param moduleName - The name of the module using this database
   */
  constructor(moduleName: Modules) {
    this.moduleName = moduleName;
    this.db = Database.getInstance().getDb();
  }

  /**
   * Gets the total number of rows in a specified table
   * @param table - The Drizzle ORM table to count rows from
   * @returns The total count of rows in the table
   */
  async getRowsCount(table: PgTable): Promise<number> {
    const result = await this.db.select({ count: count() }).from(table);
    return result[0]?.count ?? 0;
  }

  // Audit Log Methods

  /**
   * Creates a new entry to the audit log, current timestamp will be used
   * @param newAuditLog - The audit log entry to insert
   */
  protected async createAuditLog(newAuditLog: Omit<NewAuditLog, "timestamp" | "moduleName">): Promise<void> {
    const newAuditLogWithModuleName: NewAuditLog = {
      ...newAuditLog,
      moduleName: this.moduleName,
    };
    await this.db.insert(auditLog).values(newAuditLogWithModuleName);
  }

  /**
   * Creates a new entry to the audit log with a timestamp
   * @param newAuditLog - The audit log entry to insert
   */
  protected async createAuditLogWithDate(newAuditLog: Omit<NewAuditLog, "moduleName">): Promise<void> {
    const newAuditLogWithModuleName: NewAuditLog = {
      ...newAuditLog,
      moduleName: this.moduleName,
    };
    await this.db.insert(auditLog).values(newAuditLogWithModuleName);
  }

  /**
   * Gets the total count of audit logs for this module
   * @returns The number of audit log entries for this module
   */
  async getCountAuditLogs(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(auditLog).where(eq(auditLog.moduleName, this.moduleName));
    return result[0]?.count ?? 0;
  }

  /**
   * Retrieves audit logs for this module
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries
   */
  async getAuditLogs(limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db.select().from(auditLog).where(eq(auditLog.moduleName, this.moduleName));
    }
    return await this.db.select().from(auditLog).where(eq(auditLog.moduleName, this.moduleName)).limit(limit);
  }

  /**
   * Retrieves audit logs for this module filtered by action type
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries matching the action
   */
  async getAuditLogsByAction(action: string, limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, this.moduleName), eq(auditLog.action, action)));
    }
    return await this.db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.moduleName, this.moduleName), eq(auditLog.action, action)))
      .limit(limit);
  }

  /**
   * Retrieves audit logs for this module filtered by user ID
   * @param userId - The Discord user ID to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries for the specified user
   */
  async getAuditLogsByUser(userId: string, limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, this.moduleName), eq(auditLog.userId, userId)));
    }
    return await this.db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.moduleName, this.moduleName), eq(auditLog.userId, userId)))
      .limit(limit);
  }

  /**
   * Retrieves audit logs for this module filtered by both user ID and action type
   * @param userId - The Discord user ID to filter by
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries matching both user and action
   */
  async getAuditLogsByUserAndAction(userId: string, action: string, limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.moduleName, this.moduleName), eq(auditLog.userId, userId), eq(auditLog.action, action)));
    }
    return await this.db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.moduleName, this.moduleName), eq(auditLog.userId, userId), eq(auditLog.action, action)))
      .limit(limit);
  }

  /**
   * Retrieves a specific audit log entry by ID
   * @param id - The unique identifier of the audit log entry
   * @returns The audit log entry if found, undefined otherwise
   */
  async getAuditLog(id: string): Promise<AuditLog | undefined> {
    return (await this.db.select().from(auditLog).where(eq(auditLog.id, id)).limit(1))[0];
  }

  /**
   * Truncates a table
   * @param table - The table to truncate
   */
  protected async truncateTable(table: PgTable): Promise<void> {
    await this.db.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
  }

  protected async select1(table: PgTable, where: SQL): Promise<boolean> {
    return (
      (
        await this.db
          .select({ one: sql<number>`1` })
          .from(table)
          .where(where)
      ).length > 0
    );
  }
}
