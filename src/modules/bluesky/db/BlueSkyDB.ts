import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { blueSkyState } from "./schema";
import { eq } from "drizzle-orm";

export interface IAuditLogInfo {
  account: string;
}

export enum BlueSkyActionType {
  ADD = "ADD",
  REMOVE = "REMOVE",
}

export default class BlueSkyDB extends ModuleDatabase {
  constructor() {
    super("BlueSky");
  }

  async addAuditLog(type: BlueSkyActionType, user: string, info: IAuditLogInfo): Promise<void> {
    await this.createAuditLog({
      action: type,
      userId: user,
      details: info,
    });
  }

  async updateLastPostTime(newPostTime: Date): Promise<void> {
    await this.db.update(blueSkyState).set({ date: newPostTime, updatedAt: new Date() }).where(eq(blueSkyState.key, "lastPostTimeId"));
  }

  async getLastPostTime(): Promise<Date | undefined> {
    const lastPostTime = await this.db.select({ date: blueSkyState.date }).from(blueSkyState).where(eq(blueSkyState.key, "lastPostTimeId"));
    if (lastPostTime.length === 0) {
      return undefined;
    }
    if (lastPostTime[0].date == null) {
      return undefined;
    }
    return lastPostTime[0].date;
  }
}
