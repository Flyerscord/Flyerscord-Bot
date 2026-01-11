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

  addModule(module: Module<any>): void {
    this.modules.push(module);
  }

  removeModule(module: Modules): void {
    this.modules = this.modules.filter((m) => m.name !== module);
  }

  getModules(): Module<any>[] {
    return this.modules;
  }

  getModule(name: Modules): Module<any> | undefined {
    return this.modules.find((module) => module.name === name);
  }

  isModuleAdded(name: Modules): boolean {
    return this.modules.some((module) => module.name === name);
  }

  async enableModule(name: Modules): Promise<boolean> {
    const module = this.getModule(name);
    if (!module) {
      Stumper.error(`Module ${name} not found!`, "common:ModuleManager:enableModule");
      return false;
    }

    const deps = module.getDependencies();
    for (const dep of deps) {
      if (!this.isModuleAdded(dep)) {
        Stumper.error(`Module ${module.name} depends on ${dep} but ${dep} is not added!`, "common:ModuleManager:enableModule");
        return false;
      }

      const depModule = this.getModule(dep)!;
      if (!depModule.isStarted()) {
        Stumper.error(`Module ${module.name} depends on ${dep} but ${dep} is not started!`, "common:ModuleManager:enableModule");
        return false;
      }
    }

    const result = await module.enable();
    if (!result) {
      Stumper.error(`Failed to enable module ${module.name}!`, "common:ModuleManager:enableModule");
    }
    return result;
  }

  async disableAllModules(): Promise<boolean> {
    let result = true;
    // Disable in reverse order
    for (let i = this.modules.length - 1; i >= 0; i--) {
      const module = this.modules[i];
      result = result && (await module.disable());
    }
    return result;
  }

  async enableAllModules(): Promise<boolean> {
    let result = true;
    for (const module of this.modules) {
      result = result && (await this.enableModule(module.name));
    }
    return result;
  }

  async registerAllModules(): Promise<void> {
    Stumper.info(`Registering ${this.modules.length} modules...`, "common:ModuleManager:registerAllModules");
    for (const module of this.modules) {
      await module.register();
    }
  }
}
