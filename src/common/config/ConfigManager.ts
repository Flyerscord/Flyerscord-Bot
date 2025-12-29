import type { IKeyedObject } from "@common/interfaces/IKeyedObject";
import { Singleton } from "@common/models/Singleton";
import { ModuleConfigMap, Modules } from "@modules/Modules";
import { DB, getDb } from "../db/db";

export interface IModuleConfig {
  [key: string]: unknown;
}

export default class ConfigManager extends Singleton {
  private db: DB;
  constructor() {
    super();
    this.db = getDb();
  }

  getConfig(moduleName: Modules): IModuleConfig {
    return this.db.select().from.
  }

  setConfig<M extends Modules>(module: M, config: ModuleConfigMap[M] | IKeyedObject): void {
    this.configs[module] = config as ModuleConfigMap[M];
  }
}
