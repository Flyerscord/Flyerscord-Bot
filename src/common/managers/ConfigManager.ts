import { Singleton } from "@common/models/Singleton";
import { Modules, ModuleConfigMap } from "@modules/Modules";
import Database, { PostgresDB } from "../db/db";
import { config, NewConfig } from "../db/schema";
import Stumper from "stumper";
import type { IModuleConfigSchema } from "../models/Module";
import { z } from "zod";

/**
 * Extract TypeScript type from a Zod schema
 */
export type InferSchemaType<T extends z.ZodType> = z.infer<T>;

/**
 * Convert an array of config schemas to a typed record object
 *
 * @example
 * ```typescript
 * const schemas = [
 *   { key: "token" as const, schema: z.string(), ... },
 *   { key: "port" as const, schema: z.number(), ... }
 * ] as const;
 *
 * type Config = ConfigFromSchemas<typeof schemas>;
 * // Result: { token: string; port: number }
 * ```
 */
export type ConfigFromSchemas<TSchemas extends readonly IModuleConfigSchema<string>[] | IModuleConfigSchema<string>[]> = TSchemas extends
  | readonly IModuleConfigSchema<infer TKey>[]
  | IModuleConfigSchema<infer TKey>[]
  ? {
      [K in TKey]: InferSchemaType<Extract<TSchemas[number], { key: K }>["schema"]>;
    }
  : never;

interface IConfig<TSchema extends z.ZodType = z.ZodType> extends Omit<IModuleConfigSchema<string>, "schema"> {
  schema: TSchema;
  rawValue?: string; // Unparsed value from database for comparison
  value?: z.infer<TSchema>; // Parsed and validated value
}

interface IRefreshConfigResult {
  success: boolean;
  keysRequireRestart: string[];
  keysChanged: string[];
  configsMissingFromMap: {
    module: Modules;
    key: string;
  }[];
}

export default class ConfigManager extends Singleton {
  private db: PostgresDB;

  private loaded: boolean = false;
  private configs: Map<Modules, IConfig<z.ZodType>[]>;

  constructor() {
    super();
    this.db = Database.getInstance().getDb();
    this.configs = new Map();
  }

  /**
   * Check if the config has been loaded yet
   * @returns If the config has been loaded yet
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Refresh all config values from the database
   * Parses raw DB values using Zod schemas and updates the in-memory cache
   *
   * @returns Result object containing success status and lists of changed/restart-required keys
   *
   * @remarks
   * - Compares raw DB values against cached values to detect changes
   * - Required configs without DB values are cleared and marked as failed
   * - Optional configs without DB values use their default values
   * - Triggers parsing and validation for all config values
   */
  async refreshConfig(): Promise<IRefreshConfigResult> {
    const results: IRefreshConfigResult = {
      success: true,
      keysRequireRestart: [],
      keysChanged: [],
      configsMissingFromMap: [],
    };

    const allConfigs = await this.db.select().from(config);

    if (allConfigs.length === 0) {
      Stumper.error("No configs found", "common:ConfigManager:refreshConfig");
      results.success = false;
      return results;
    }

    for (const dbConfig of allConfigs) {
      const configSchema = this.configs.get(dbConfig.moduleName)?.find((schema) => schema.key === dbConfig.key);
      if (!configSchema) {
        Stumper.error(
          `Config ${dbConfig.moduleName}_${dbConfig.key} was found in database but not in config map`,
          "common:ConfigManager:refreshConfig",
        );
        results.configsMissingFromMap.push({ module: dbConfig.moduleName, key: dbConfig.key });
        continue;
      }

      // Determine the new raw value (as string)
      let newRawValue: string;
      if (dbConfig.value) {
        newRawValue = dbConfig.value;
      } else {
        newRawValue = String(configSchema.defaultValue);
      }

      // Check if value changed
      const valueChanged = configSchema.rawValue !== newRawValue;

      // Only update if value changed
      if (!valueChanged) {
        continue;
      }

      // Track changes
      results.keysChanged.push(dbConfig.key);
      if (configSchema.requiresRestart) {
        results.keysRequireRestart.push(dbConfig.key);
      }

      // Handle different scenarios
      if (!dbConfig.value && configSchema.required) {
        // DB is empty, required -> clear cached value
        Stumper.warning(`Config ${dbConfig.moduleName}_${dbConfig.key} is required but has no value in DB`, "common:ConfigManager:refreshConfig");
        await this.updateConfigValue(dbConfig.moduleName, dbConfig.key, null, null);
        results.success = false;
      } else if (!dbConfig.value && !configSchema.required) {
        // DB is empty, optional -> use default value
        await this.updateConfigValue(dbConfig.moduleName, dbConfig.key, newRawValue, newRawValue);
      } else {
        // DB has value -> parse and use it
        await this.updateConfigValue(dbConfig.moduleName, dbConfig.key, newRawValue, newRawValue);
      }
    }
    this.loaded = true;
    return results;
  }

  /**
   * Register a new config schema for a module
   * Adds the schema to the in-memory map and creates a DB entry if it doesn't exist
   *
   * @param module - The module name
   * @param configSchema - The config schema definition with Zod validator
   *
   * @remarks
   * - Called during module initialization via `registerConfigSchema()`
   * - Uses `onConflictDoNothing()` to safely handle existing DB entries
   * - Only stores minimal data in DB (moduleName, key)
   * - Schema metadata (description, required, etc.) lives in code only
   */
  async addNewConfigSchema<T extends string>(module: Modules, configSchema: IModuleConfigSchema<T>): Promise<void> {
    const currentConfigSchemas = this.configs.get(module);
    if (currentConfigSchemas) {
      currentConfigSchemas.push(configSchema);
    } else {
      this.configs.set(module, [configSchema]);
    }

    const newConfig: NewConfig = {
      moduleName: module,
      key: configSchema.key,
    };

    await this.db.insert(config).values(newConfig).onConflictDoNothing();
  }

  /**
   * Validate that all required configs for a module have values
   *
   * @param module - The module name to validate
   * @returns `true` if all required configs have values, `false` otherwise
   *
   * @remarks
   * - Called during module initialization after schemas are registered
   * - Checks that `config.value` is defined for all required configs
   * - Logs errors for missing required values
   * - Modules without any configs are considered valid
   */
  validateModule(module: Modules): boolean {
    if (!this.loaded) {
      Stumper.error(`Configs have not been loaded yet!`, "common:ConfigManager:validateModule");
      return false;
    }

    const moduleConfigs = this.configs.get(module);

    if (!moduleConfigs) {
      Stumper.warning(`Module ${module} does have any configs`, "common:ConfigManager:validateModule");
      return true;
    }

    for (const config of moduleConfigs) {
      if (!config.value) {
        Stumper.error(`Config ${module}_${config.key} is required but has no value`, "common:ConfigManager:validateModule");
        return false;
      }
    }
    return true;
  }

  /**
   * Get type-safe config object for a module
   *
   * @param moduleName - The module name
   * @returns Typed config object with all parsed values
   * @throws Error if module configs are not loaded
   *
   * @example
   * ```typescript
   * const config = ConfigManager.getInstance().getConfig("Common");
   * console.log(config.token); // Type: string, fully autocompleted!
   * console.log(config.logLevel); // Type: number
   * ```
   *
   * @remarks
   * - Returns a plain object mapping config keys to their parsed values
   * - Type is inferred from `ModuleConfigMap` based on module name
   * - Only includes configs where `value !== undefined`
   * - Values are already parsed and validated by Zod schemas
   */
  getConfig<TModule extends Modules>(moduleName: TModule): ModuleConfigMap[TModule] {
    if (!this.loaded) {
      Stumper.error(`Configs have not been loaded yet!`, "common:ConfigManager:getConfig");
      throw new Error(`Configs have not been loaded yet!`);
    }
    const moduleConfigs = this.configs.get(moduleName);
    if (!moduleConfigs) {
      throw new Error(`Config for module ${moduleName} not loaded`);
    }

    // Build typed config object from IConfig array
    const configObj: Record<string, unknown> = {};
    for (const configSchema of moduleConfigs) {
      if (configSchema.value !== undefined) {
        configObj[configSchema.key] = configSchema.value;
      }
    }

    return configObj as ModuleConfigMap[TModule];
  }

  /**
   * Update a config value in the in-memory schema map
   *
   * @param module - Module name
   * @param key - Config key
   * @param rawValue - Unparsed value to store (for change detection)
   * @param valueToParse - Value to parse with Zod schema (null to clear)
   *
   * @remarks
   * - Updates both `rawValue` (unparsed) and `value` (parsed) in the schema
   * - If `valueToParse` is null, clears the value without parsing
   * - Uses `parseValue()` to handle Zod validation and transformations
   * - Called by `refreshConfig()` to sync DB values with in-memory cache
   */
  private async updateConfigValue(module: Modules, key: string, rawValue: string | null, valueToParse: string | null): Promise<void> {
    const moduleConfigs = this.configs.get(module);
    if (!moduleConfigs) {
      return;
    }

    const configSchemaIndex = moduleConfigs.findIndex((schema) => schema.key === key);
    if (configSchemaIndex === -1) {
      return;
    }

    const configSchema = moduleConfigs[configSchemaIndex];

    // Parse the value if provided
    let parsedValue: unknown = null;
    if (valueToParse !== null) {
      parsedValue = await this.parseValue(valueToParse, configSchema);
    }

    // Update the config schema with new values
    moduleConfigs[configSchemaIndex] = {
      ...configSchema,
      rawValue: rawValue ?? undefined,
      value: parsedValue,
    };

    this.configs.set(module, moduleConfigs);
  }

  /**
   * Parse and validate a raw string value using its Zod schema
   *
   * @param rawValue - Raw string value from database
   * @param configSchema - Config schema containing Zod validator
   * @returns Parsed and validated value (type depends on schema)
   *
   * @remarks
   * - Calls `schema.parseAsync()` to parse and transform the value
   * - Zod schemas handle all transformations (string→number, decryption, etc.)
   * - On parse failure for required configs: returns empty string
   * - On parse failure for optional configs: attempts to parse default value
   * - All errors are logged via `Stumper.caughtError`
   *
   * @example
   * ```typescript
   * // Schema with transform for decryption
   * const schema = z.string().transform(val => decrypt(val));
   * const parsed = await parseValue("encrypted123", configSchema);
   * // Returns decrypted string
   * ```
   */
  private async parseValue(rawValue: string, configSchema: IConfig<z.ZodType>): Promise<unknown> {
    try {
      // Parse the value with the Zod schema
      // The schema handles all transformations (string->number, decryption, etc.)
      const result = await configSchema.schema.parseAsync(rawValue);
      return result;
    } catch (error) {
      Stumper.caughtError(error, `common:ConfigManager:parseValue:${configSchema.key}`);

      // If required, return empty string - validation will catch missing required values
      if (configSchema.required) {
        return "";
      }

      // For optional configs, parse and return the default value
      try {
        return await configSchema.schema.parseAsync(configSchema.defaultValue);
      } catch (defaultError) {
        Stumper.caughtError(defaultError, `common:ConfigManager:parseValue:${configSchema.key}:defaultValue`);
        return "";
      }
    }
  }
}
