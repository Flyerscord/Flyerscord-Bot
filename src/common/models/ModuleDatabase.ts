import { Modules } from "@modules/Modules";
import Database, { PostgresDB } from "../db/db";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { count, sql, SQL } from "drizzle-orm";
import { AuditLog, NewAuditLog } from "../db/schema";
import AL from "../utils/MyAuditLog";

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

  /**
   * Retrieves a single row from a table matching the given condition
   * @param table - The table to query
   * @param where - The SQL condition to match
   * @returns The first matching row, or undefined if no match is found
   *
   * @example
   * ```typescript
   * const user = await this.getSingleRow<UserRow>(
   *   usersTable,
   *   eq(usersTable.id, userId)
   * );
   * ```
   */
  protected async getSingleRow<T>(table: PgTable, where: SQL): Promise<T | undefined> {
    const result = await this.db.select().from(table).where(where).limit(1);
    if (result.length === 0) {
      return undefined;
    }
    return result[0] as T;
  }

  /**
   * Truncates a table
   * @param table - The table to truncate
   */
  protected async truncateTable(table: PgTable): Promise<void> {
    await this.db.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
  }

  /**
   * Checks if at least one row exists in a table matching the given condition
   * @param table - The table to query
   * @param where - The SQL condition to match
   * @returns True if at least one matching row exists, false otherwise
   */
  protected async select1(table: PgTable, where: SQL): Promise<boolean> {
    return (
      (
        await this.db
          .select({ one: sql<number>`1` })
          .from(table)
          .where(where)
          .limit(1)
      ).length > 0
    );
  }

  /**
   * Creates a SQL expression to increment a column value.
   *
   * @param column - The column to increment
   * @param amount - The amount to increment by (default: 1)
   * @returns SQL expression for incrementing the column
   *
   * @example
   * ```typescript
   * await db.update(table)
   *   .set({ count: this.increment(table.count, 5) })
   *   .where(eq(table.id, id));
   * ```
   */
  protected increment(column: PgColumn, amount = 1): SQL {
    return sql`${column} + ${amount}`;
  }

  /**
   * Creates a SQL expression to decrement a column value.
   *
   * @param column - The column to decrement
   * @param amount - The amount to decrement by (default: 1)
   * @returns SQL expression for decrementing the column
   *
   * @example
   * ```typescript
   * await db.update(table)
   *   .set({ count: this.decrement(table.count, 3) })
   *   .where(eq(table.id, id));
   * ```
   */
  protected decrement(column: PgColumn, amount = 1): SQL {
    return sql`${column} - ${amount}`;
  }

  // Audit Log Methods

  /**
   * Creates a new entry to the audit log, current timestamp will be used
   * @param newAuditLog - The audit log entry to insert
   * @param suppressErrors - If true (default), errors will be caught and logged. If false, errors will be thrown.
   */
  createAuditLog(newAuditLog: Omit<NewAuditLog, "timestamp" | "moduleName">, suppressErrors: boolean = true): Promise<void> {
    return AL.createAuditLog(this.moduleName, newAuditLog, suppressErrors);
  }

  /**
   * Gets the total count of audit logs for this module
   * @returns The number of audit log entries for this module
   */
  async getCountAuditLogs(): Promise<number> {
    return await AL.getCountAuditLogs(this.moduleName);
  }

  /**
   * Retrieves audit logs for this module
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries
   */
  async getAuditLogs(limit: number = Infinity): Promise<AuditLog[]> {
    return await AL.getAuditLogs(this.moduleName, limit);
  }

  /**
   * Retrieves audit logs for this module filtered by action type
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries matching the action
   */
  async getAuditLogsByAction(action: string, limit: number = Infinity): Promise<AuditLog[]> {
    return await AL.getAuditLogsByAction(this.moduleName, action, limit);
  }

  /**
   * Retrieves audit logs for this module filtered by user ID
   * @param userId - The Discord user ID to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries for the specified user
   */
  async getAuditLogsByUser(userId: string, limit: number = Infinity): Promise<AuditLog[]> {
    return await AL.getAuditLogsByUser(this.moduleName, userId, limit);
  }

  /**
   * Retrieves audit logs for this module filtered by both user ID and action type
   * @param userId - The Discord user ID to filter by
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: Infinity for all logs)
   * @returns Array of audit log entries matching both user and action
   */
  async getAuditLogsByUserAndAction(userId: string, action: string, limit: number = Infinity): Promise<AuditLog[]> {
    return await AL.getAuditLogsByUserAndAction(this.moduleName, userId, action, limit);
  }

  /**
   * Retrieves a specific audit log entry by ID
   * @param id - The unique identifier of the audit log entry
   * @returns The audit log entry if found, undefined otherwise
   */
  async getAuditLog(id: string): Promise<AuditLog | undefined> {
    return await AL.getAuditLog(id);
  }
}
