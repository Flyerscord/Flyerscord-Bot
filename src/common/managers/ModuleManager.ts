/* eslint-disable @typescript-eslint/no-explicit-any */
import Stumper from "stumper";
import Module from "../models/Module";
import { Singleton } from "../models/Singleton";
import { ModuleMap, Modules } from "../../modules/Modules";
import Env from "../utils/Env";

export default class ModuleManager extends Singleton {
  private modules: Module<any>[];

  constructor() {
    super();
    this.modules = [];
  }

  addAllModules(): void {
    this.modules = [];
    const productionMode = Env.getBoolean("PRODUCTION_MODE");

    // Sort modules by load priority (lowest first)
    const sortedModules = Object.entries(ModuleMap).sort((a, b) => a[1].getLoadPriority() - b[1].getLoadPriority());

    Stumper.info(`Adding ${sortedModules.length} modules to manager...`, "common:ModuleManager:addAllModules");
    for (const [_key, value] of sortedModules) {
      if (!productionMode && value.isProdOnly()) {
        Stumper.info(`Skipping ${value.name} module (prodOnly)`, "common:ModuleManager:addAllModules");
        continue;
      }
      this.modules.push(value);
    }
  }

  removeModule(module: Modules): void {
    this.modules = this.modules.filter((m) => m.name !== module);
    Stumper.info(`Removed module ${module}`, "common:ModuleManager:removeModule");
  }

  getModules(): Module<any>[] {
    return this.modules;
  }

  getModuleNames(): Modules[] {
    return this.modules.map((module) => module.name);
  }

  getModule(name: Modules): Module<any> | undefined {
    return this.modules.find((module) => module.name === name);
  }

  isModuleAdded(name: Modules): boolean {
    return this.modules.some((module) => module.name === name);
  }

  private async enableModule(name: Modules): Promise<boolean> {
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
    Stumper.info(`Disabling ${this.modules.length} modules...`, "common:ModuleManager:disableAllModules");
    let result = true;
    // Disable in reverse order
    for (let i = this.modules.length - 1; i >= 0; i--) {
      const module = this.modules[i];
      result = result && (await module.disable());
    }
    return result;
  }

  async enableAllModules(): Promise<boolean> {
    Stumper.info(`Enabling ${this.modules.length} modules...`, "common:ModuleManager:enableAllModules");
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
