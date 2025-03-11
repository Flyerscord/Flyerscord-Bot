/* eslint-disable @typescript-eslint/no-explicit-any */
import Module from "../models/Module";
import { Singleton } from "../models/Singleton";

export default class ModuleManager extends Singleton {
  private modules: Module<any>[];

  constructor() {
    super();
    this.modules = [];
  }

  async addModule(module: Module<any>, enable: boolean = true): Promise<void> {
    if (enable) {
      await module.enable();
    }
    this.modules.push(module);
  }

  getModules(): Module<any>[] {
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
}
