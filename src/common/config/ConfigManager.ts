import { Singleton } from "@common/models/Singleton";
import { Modules } from "@modules/Modules";
import Database, { PostgresDB } from "../db/db";
import { Config, config, NewConfig, ValueType } from "../db/schema";
import { eq, and } from "drizzle-orm";
import SecretManager from "./SecretManager";
import Stumper from "stumper";

export interface IModuleConfig {
  [key: string]: unknown;
}

export interface IConfigInfo<T extends string> extends Omit<NewConfig, "key" | "value" | "updatedAt"> {
  key: T;
}

export type IConfigInfoNoModule<T extends string> = Omit<IConfigInfo<T>, "moduleName">;

interface ILoadedConfig<T> {
  moduleName: Modules;
  key: string;
  value: T;
}

export type LoadedConfig = ILoadedConfig<string | boolean | number | object>;

export default class ConfigManager extends Singleton {
  private db: PostgresDB;

  private configs: LoadedConfig[];
  private fullConfigs: Config[];

  constructor() {
    super();
    this.db = Database.getInstance().getDb();

    this.configs = [];
    this.fullConfigs = [];
  }

  async refreshConfig(): Promise<LoadedConfig[]> {
    const results = await this.db.select().from(config);

    if (results.length === 0) {
      Stumper.error("No configs found", "common:ConfigManager:retreiveFullConfig");
      this.configs = [];
      this.fullConfigs = [];
      return [];
    }

    this.fullConfigs = results;

    for (const result of results) {
      const value = await this.getValue(result);
      if (value === null) {
        continue;
      }

      this.configs.push({
        moduleName: result.moduleName,
        key: result.key,
        value: value,
      });
    }
    return this.configs;
  }

  getConfig(): LoadedConfig[] {
    return this.configs;
  }

  validateConfig(module: Modules, key: string): boolean {
    const config = this.getConfigByModuleAndKey(module, key);
    if (!config) {
      Stumper.error(`Config ${module}.${key} does not exist`, "common:ConfigManager:validateConfig");
      return false;
    }

    if (config.required && !config.value) {
      Stumper.error(`Config ${module}.${key} is required but has no value`, "common:ConfigManager:validateConfig");
      return false;
    }

    return true;
  }

  validateModule(module: Modules): boolean {
    const moduleConfig = this.fullConfigs.filter((config) => config.moduleName === module);
    if (moduleConfig.length === 0) {
      Stumper.warning(`Module ${module} does have any configs`, "common:ConfigManager:validateModule");
      return true;
    }

    for (const config of moduleConfig) {
      if (config.required && !config.value) {
        Stumper.error(`Config ${module}.${config.key} is required but has no value`, "common:ConfigManager:validateModule");
        return false;
      }
    }
    return true;
  }

  getLoadedConfigByModuleAndKey(module: Modules, key: string): LoadedConfig | undefined {
    return this.configs.find((config) => config.moduleName === module && config.key === key);
  }

  private getConfigByModuleAndKey(module: Modules, key: string): Config | undefined {
    return this.fullConfigs.find((config) => config.moduleName === module && config.key === key);
  }

  private async getConfigFromDb(module: Modules, key: string): Promise<Config | undefined> {
    const results = await this.db
      .select()
      .from(config)
      .where(and(eq(config.moduleName, module), eq(config.key, key)));

    if (results.length === 0) {
      Stumper.error(`Config ${module}.${key} does not exist`, "common:ConfigManager:getConfigFromDb");
      return undefined;
    }

    return results[0];
  }

  private async getValue(configValue: Config): Promise<string | boolean | number | object | null> {
    if (configValue.value === null && !configValue.required) {
      if (configValue.valueType === ValueType.ENCRYPTED) {
        const secretManager = SecretManager.getInstance();
        return secretManager.decrypt(configValue.defaultValue);
      }
      return configValue.defaultValue;
    } else if (configValue.value === null) {
      Stumper.error(`Config ${configValue.moduleName}.${configValue.key} is required but has no value`, "common:ConfigManager:getKeyValue");
      return null;
    }

    if (configValue.valueType === ValueType.ENCRYPTED) {
      const secretManager = SecretManager.getInstance();
      return secretManager.decrypt(configValue.value);
    }

    if (configValue.valueType === ValueType.OBJECT) {
      return JSON.parse(configValue.value);
    }

    if (configValue.valueType === ValueType.BOOLEAN) {
      return configValue.value === "true";
    }

    if (configValue.valueType === ValueType.NUMBER) {
      return Number(configValue.value);
    }

    return configValue.value;
  }

  async addNewConfig(newConfig: NewConfig): Promise<void> {
    await this.db.insert(config).values(newConfig).onConflictDoNothing();
  }

  async updateConfig(module: Modules, key: string, value: unknown): Promise<void> {
    const configValue = await this.getConfigFromDb(module, key);

    if (!configValue) {
      throw new Error(`Config ${module}.${key} does not exist`);
    }

    if (configValue.valueType === ValueType.ENCRYPTED && typeof value !== "string") {
      throw new Error(`Encrypted config ${module}.${key} must be a string`);
    }

    // Validate type for non-encrypted values (encrypted values are always strings)
    if (configValue.valueType !== ValueType.ENCRYPTED && typeof value !== configValue.valueType) {
      throw new Error(`New value ${value} is not of type ${configValue.valueType}`);
    }

    let newValue: string;
    if (configValue.valueType === ValueType.ENCRYPTED) {
      const secretManager = SecretManager.getInstance();
      newValue = secretManager.encrypt(value as string);
    } else if (configValue.valueType === ValueType.OBJECT) {
      newValue = JSON.stringify(value);
    } else if (configValue.valueType === ValueType.BOOLEAN) {
      newValue = value ? "true" : "false";
    } else if (configValue.valueType === ValueType.NUMBER) {
      newValue = (value as number).toString();
    } else {
      newValue = (value as string).toString();
    }

    await this.db
      .update(config)
      .set({ value: newValue })
      .where(and(eq(config.moduleName, module), eq(config.key, key)));
  }
}
