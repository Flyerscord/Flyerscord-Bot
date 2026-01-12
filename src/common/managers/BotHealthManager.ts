import Stumper from "stumper";
import { Singleton } from "../models/Singleton";
import MyAuditLog from "../utils/MyAuditLog";
import { AuditLogSeverity } from "../db/schema";

export default class BotHealthManager extends Singleton {
  private healthy: boolean;

  constructor() {
    super();
    this.healthy = false;
    Stumper.warning("Bot is NOT healthy!", "common:BotHealthManager:setHealthy");
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  setHealthy(healthy: boolean): void {
    this.healthy = healthy;

    if (healthy) {
      void MyAuditLog.createAuditLog("Common", {
        action: "BotHealthy",
        severity: AuditLogSeverity.INFO,
      });

      Stumper.success("Bot is healthy!", "common:BotHealthManager:setHealthy");
    } else {
      void MyAuditLog.createAuditLog("Common", {
        action: "BotUnhealthy",
        severity: AuditLogSeverity.ERROR,
      });

      Stumper.warning("Bot is NOT healthy!", "common:BotHealthManager:setHealthy");
    }
  }
}
