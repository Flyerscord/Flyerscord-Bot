import { IDefaultConfig } from "../interfaces/IDefaultConfig";
import Module from "../models/Module";

export default class ModuleManager {
  private static instance: ModuleManager;

  private modules: Module[];

  private constructor() {
    this.modules = [];
  }

  static getInstance(): ModuleManager {
    return this.instance || (this.instance = new this());
  }

  async addModule(module: Module, enable: boolean = true): Promise<void> {
    if (enable) {
      await module.enable();
    }
    this.modules.push(module);
  }

  getModules(): Module[] {
    return this.modules;
  }

  disableAllModules(): void {
    this.modules.forEach((module) => module.disable());
  }

  async enableAllModules(): Promise<void> {
    for (const module of this.modules) {
      await module.enable();
    }
  }

  getAllDefaultConfigs(): IDefaultConfig[] {
    const configs: IDefaultConfig[] = [];
    for (const module of this.modules) {
      const defaultConfig = module.getDefaultConfig();
      if (Object.keys(defaultConfig).length > 0) {
        configs.push(defaultConfig);
      }
    }
    return configs;
  }
}
