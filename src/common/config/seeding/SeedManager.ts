import { Modules } from "@root/src/modules/Modules";
import { Singleton } from "../../models/Singleton";
import { ISeed } from "./ISeed";
import { seeds } from "./Seeds";
import ConfigManager from "../ConfigManager";
import Stumper from "stumper";

export default class SeedManager extends Singleton {
  constructor() {
    super();
  }

  getSeedsByModule(moduleName: Modules): ISeed[] {
    return seeds.filter((seed) => seed.moduleName === moduleName);
  }

  async seedModule(moduleName: Modules): Promise<void> {
    const seeds = this.getSeedsByModule(moduleName);
    const configManager = ConfigManager.getInstance();

    for (const seed of seeds) {
      try {
        await configManager.updateConfig(seed.moduleName, seed.key, seed.value);
      } catch (error) {
        Stumper.error(`Failed to seed config for module ${moduleName} with key ${seed.key}`, "common:SeedManager:seedModule");
        Stumper.caughtError(error, "common:SeedManager:seedModule");
      }
    }
  }
}
