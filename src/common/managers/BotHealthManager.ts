import Stumper from "stumper";
import { Singleton } from "../models/Singleton";

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
      Stumper.success("Bot is healthy!", "common:BotHealthManager:setHealthy");
    } else {
      Stumper.warning("Bot is NOT healthy!", "common:BotHealthManager:setHealthy");
    }
  }
}
