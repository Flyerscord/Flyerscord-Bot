import { Singleton } from "@common/models/Singleton";
import { Modules } from "@modules/Modules";
import { PostgresDB, getDb } from "../db/db";
import { Config, config, NewConfig, ValueType } from "../db/schema";
import { eq, and } from "drizzle-orm";
import SecretManager from "./SecretManager";

export interface IModuleConfig {
  [key: string]: unknown;
}

export default class ConfigManager extends Singleton {
  private db: PostgresDB;
  constructor() {
    super();
    this.db = getDb();
  }

  private async getConfig(module: Modules, key: string): Promise<Config | undefined> {
    const results = await this.db
      .select()
      .from(config)
      .where(and(eq(config.moduleName, module), eq(config.key, key)));

    if (results.length === 0) {
      return undefined;
    }

    return results[0];
  }

  async getKeyValue(module: Modules, key: string): Promise<unknown> {
    const configValue = await this.getConfig(module, key);

    if (!configValue) {
      return null;
    }

    if (configValue.value === null) {
      if (configValue.valueType === ValueType.ENCRYPTED) {
        const secretManager = new SecretManager();
        return secretManager.decrypt(configValue.defaultValue);
      }
      return configValue.defaultValue;
    }

    if (configValue.valueType === ValueType.ENCRYPTED) {
      const secretManager = new SecretManager();
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
    const configValue = await this.getConfig(module, key);

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
      const secretManager = new SecretManager();
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
