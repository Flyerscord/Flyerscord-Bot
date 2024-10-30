import Stumper from "stumper";

export default class BotHealthManager {
  private static instance: BotHealthManager;

  private healthy: boolean;

  private constructor() {
    this.healthy = false;
    Stumper.warning("Bot is NOT healthy!", "BotHealthManager:setHealthy");
  }

  static getInstance(): BotHealthManager {
    if (!BotHealthManager.instance) {
      BotHealthManager.instance = new BotHealthManager();
    }
    return BotHealthManager.instance;
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  setHealthy(healthy: boolean): void {
    this.healthy = healthy;

    if (healthy) {
      Stumper.success("Bot is healthy!", "BotHealthManager:setHealthy");
    } else {
      Stumper.warning("Bot is NOT healthy!", "BotHealthManager:setHealthy");
    }
  }
}
