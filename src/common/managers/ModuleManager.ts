/* eslint-disable @typescript-eslint/no-explicit-any */
import Stumper from "stumper";
import Module from "../models/Module";
import { Singleton } from "../models/Singleton";
import { Modules } from "../../modules/Modules";

export default class ModuleManager extends Singleton {
  private modules: Module<any>[];

  constructor() {
    super();
    this.modules = [];
  }

  async addModule(module: Module<any>, enable: boolean = true): Promise<boolean> {
    let result = true;
    if (enable) {
      const deps = module.getDependencies();
      for (const dep of deps) {
        if (!this.isModuleAdded(dep)) {
          throw new Error(`Module ${module.name} depends on ${dep} but ${dep} is not enabled!`);
        }
      }

      result = await module.enable();
    }
    this.modules.push(module);
    return result;
  }

  getModules(): Module<any>[] {
    return this.modules;
  }

  disableAllModules(): void {
    this.modules.forEach((module) => module.disable());
  }

  async enableAllModules(): Promise<void> {
    for (const module of this.modules) {
      const deps = module.getDependencies();
      let isOkay = true;
      for (let i = 0; i < deps.length && isOkay; i++) {
        const dep = deps[i];
        if (!this.isModuleAdded(dep)) {
          Stumper.error(`Module ${module.name} depends on ${dep} but ${dep} is not enabled!`, "common:ModuleManager:enableAllModules");
          isOkay = false;
        }
      }

      if (isOkay) {
        await module.enable();
      }
    }
  }

  isModuleAdded(name: Modules): boolean {
    return this.modules.some((module) => module.name === name);
  }
}
