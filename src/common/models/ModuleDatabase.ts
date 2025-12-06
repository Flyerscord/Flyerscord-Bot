import { Modules } from "@modules/Modules";
import { getDb, NeonDB } from "../db/db";
import { PgTable } from "drizzle-orm/pg-core";
import { count, eq, and } from "drizzle-orm";
import { AuditLog, auditLog, NewAuditLog } from "../db/schema";

export abstract class ModuleDatabase {
  protected readonly db: NeonDB;
  protected readonly moduleName: Modules;

  constructor(moduleName: Modules) {
    this.moduleName = moduleName;
    this.db = getDb();
  }

  // TODO: Add common methods
  protected async getRowsCount(table: PgTable): Promise<number> {
    return (await this.db.select({ count: count() }).from(table))[0].count;
  }

  // Audit Log Methods
  protected async addAuditLog(newAuditLog: NewAuditLog): Promise<void> {
    await this.db.insert(auditLog).values(newAuditLog);
  }

  protected async getCountAuditLogs(): Promise<number> {
    return (await this.db.select({ count: count() }).from(auditLog).where(eq(auditLog.moduleName, this.moduleName)))[0].count;
  }

  protected async getAuditLogs(limit: number = Infinity): Promise<AuditLog[]> {
    if (limit === Infinity) {
      return await this.db.select().from(auditLog).where(eq(auditLog.moduleName, this.moduleName));
    }
    return await this.db.select().from(auditLog).where(eq(auditLog.moduleName, this.moduleName)).limit(limit);
  }

  protected async getAuditLogsByAction(action: string, limit: number = Infinity): Promise<AuditLog[]> {
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

  protected async getAuditLogsByUser(userId: string, limit: number = Infinity): Promise<AuditLog[]> {
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

  protected async getAuditLogsByUserAndAction(userId: string, action: string, limit: number = Infinity): Promise<AuditLog[]> {
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

  protected async getAuditLog(id: string): Promise<AuditLog | undefined> {
    return (await this.db.select().from(auditLog).where(eq(auditLog.id, id)).limit(1))[0];
  }
}
