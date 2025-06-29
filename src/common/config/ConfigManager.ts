import { Singleton } from "@common/models/Singleton";
import { ModuleConfigMap, Modules } from "@modules/Modules";

export default class ConfigManager extends Singleton {
  private configs: Partial<ModuleConfigMap>;

  constructor() {
    super();
    this.configs = {};
  }

  getConfig<M extends Modules>(module: M): ModuleConfigMap[M] {
    return this.configs[module] as ModuleConfigMap[M];
  }

  setConfig<M extends Modules>(module: M, config: ModuleConfigMap[M]): void {
    this.configs[module] = config;
  }
}
