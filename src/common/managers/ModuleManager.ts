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

  async addModule(module: Module): Promise<void> {
    module.enable();
    this.modules.push(module);
  }

  getModules(): Module[] {
    return this.modules;
  }

  disableAllModules(): void {
    this.modules.forEach((module) => module.disable());
  }
}
