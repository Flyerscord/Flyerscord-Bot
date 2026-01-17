import Stumper from "stumper";
import { Singleton } from "../models/Singleton";
import MyAuditLog from "../utils/MyAuditLog";
import { AuditLogSeverity } from "../db/schema";

export default class BotHealthManager extends Singleton {
  private healthy: boolean;
  private requiresRestart: boolean;

  constructor() {
    super();
    this.healthy = false;
    this.requiresRestart = false;
    Stumper.warning("Bot is NOT healthy!", "common:BotHealthManager");
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  isRequiredRestart(): boolean {
    return this.requiresRestart;
  }

  setHealthy(healthy: boolean, requiresRestart: boolean = false): void {
    if (this.healthy === healthy) {
      return;
    }
    this.requiresRestart = this.requiresRestart || requiresRestart;

    if (!this.healthy && this.requiresRestart) {
      Stumper.warning("Bot cannot be marked as healthy! You must restart to fix current issues.", "common:BotHealthManager:setHealthy");
      return;
    }

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
