/* eslint-disable @typescript-eslint/no-explicit-any */
import Module from "../models/Module";

export default class ModuleManager {
  private static instance: ModuleManager;

  private modules: Module<any>[];

  private constructor() {
    this.modules = [];
  }

  static getInstance(): ModuleManager {
    return this.instance || (this.instance = new this());
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
