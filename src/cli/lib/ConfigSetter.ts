import chalk from "chalk";
import type { SetOptions, IConfig } from "./types.js";
import type { Modules } from "../../modules/Modules.js";
import ConfigManager from "../../common/managers/ConfigManager.js";
import SecretManager from "../../common/managers/SecretManager.js";
import Database from "../../common/db/db.js";
import { config } from "../../common/db/schema.js";
import { InteractivePrompts } from "./InteractivePrompts.js";
import { SchemaInspector } from "./SchemaInspector.js";

export class ConfigSetter {
  private configManager: ConfigManager;
  private db = Database.getInstance().getDb();

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Interactive configuration setting flow
   */
  async set(options: SetOptions): Promise<void> {
    if (!this.configManager.isLoaded()) {
      console.error(chalk.red("Error: Configs have not been loaded yet"));
      return;
    }

    // Get all config schemas from ConfigManager
    const allConfigs = (this.configManager as unknown as { configs: Map<Modules, IConfig[]> }).configs;

    // Step 1: Select module (if not provided)
    let selectedModule = options.module;
    if (!selectedModule) {
      const moduleChoices = Array.from(allConfigs.keys()).map((module) => ({
        name: module,
        value: module,
      }));

      selectedModule = await InteractivePrompts.selectFromList("Select module:", moduleChoices);
    }

    // Step 2: Get module configs
    const moduleConfigs = allConfigs.get(selectedModule);
    if (!moduleConfigs || moduleConfigs.length === 0) {
      console.error(chalk.red(`No configs found for module: ${selectedModule}`));
      return;
    }

    // Step 3: Select config key (if not provided)
    let selectedConfigSchema: IConfig | undefined;
    if (options.key) {
      selectedConfigSchema = moduleConfigs.find((schema) => schema.key === options.key);
      if (!selectedConfigSchema) {
        console.error(chalk.red(`Config key "${options.key}" not found in module ${selectedModule}`));
        return;
      }
    } else {
      const configChoices = moduleConfigs.map((schema) => ({
        name: `${schema.key} - ${schema.description} (${SchemaInspector.getTypeDescription(schema.schema)})`,
        value: schema.key,
      }));

      const selectedKey = await InteractivePrompts.selectFromList("Select config to modify:", configChoices);
      selectedConfigSchema = moduleConfigs.find((schema) => schema.key === selectedKey);
    }

    if (!selectedConfigSchema) {
      console.error(chalk.red("Failed to select config schema"));
      return;
    }

    // Step 4: Display current info
    console.log(chalk.bold("\n=== Config Information ==="));
    console.log(`Module: ${chalk.cyan(selectedModule)}`);
    console.log(`Key: ${chalk.cyan(selectedConfigSchema.key)}`);
    console.log(`Description: ${selectedConfigSchema.description}`);
    console.log(`Type: ${SchemaInspector.getTypeDescription(selectedConfigSchema.schema)}`);
    console.log(`Required: ${selectedConfigSchema.required ? chalk.green("Yes") : chalk.dim("No")}`);

    const currentValue = selectedConfigSchema.value;
    if (selectedConfigSchema.secret && currentValue) {
      console.log(`Current value: ${chalk.dim("***********")}`);
    } else if (currentValue !== undefined && currentValue !== null) {
      console.log(`Current value: ${this.formatValue(currentValue)}`);
    } else {
      console.log(
        `Current value: ${chalk.dim(selectedConfigSchema.required ? chalk.red("<NOT SET>") : `(default: ${selectedConfigSchema.defaultValue})`)}`,
      );
    }

    // Step 5: Prompt for new value
    console.log(chalk.bold("\n=== Enter New Value ==="));
    const newValue = await InteractivePrompts.promptForValue(
      selectedConfigSchema.schema,
      currentValue,
      selectedConfigSchema.key,
      selectedConfigSchema.secret,
    );

    // Step 6: Preview changes
    console.log(chalk.bold("\n=== Preview Changes ==="));
    console.log(`Module: ${chalk.cyan(selectedModule)}`);
    console.log(`Key: ${chalk.cyan(selectedConfigSchema.key)}`);

    if (selectedConfigSchema.secret) {
      console.log(`Old Value: ${chalk.dim("***********")}`);
      console.log(`New Value: ${chalk.dim("***********")}`);
    } else {
      console.log(`Old Value: ${this.formatValue(currentValue)}`);
      console.log(`New Value: ${this.formatValue(newValue)}`);
    }

    // Step 7: Confirm
    const confirmed = await InteractivePrompts.confirm("\nSave this change?", true);

    if (!confirmed) {
      console.log(chalk.yellow("\n✗ Change cancelled"));
      return;
    }

    // Step 8: Save to database
    try {
      await this.saveConfigValue(selectedModule, selectedConfigSchema.key, newValue, selectedConfigSchema.secret);
      console.log(chalk.green(`\n✓ Successfully updated ${selectedModule}.${selectedConfigSchema.key}`));

      // Warn if restart required
      if (selectedConfigSchema.requiresRestart) {
        console.log(chalk.yellow("\n⚠ This config requires a bot restart to take effect"));
      }
    } catch (error) {
      console.error(chalk.red("\n✗ Failed to save config:"), error);
    }
  }

  /**
   * Save a config value to the database
   */
  private async saveConfigValue(module: Modules, key: string, value: unknown, isSecret: boolean): Promise<void> {
    // Convert value to string for storage
    let valueToStore: string;

    if (isSecret && typeof value === "string") {
      // Encrypt secret values
      valueToStore = SecretManager.getInstance().encrypt(value);
    } else if (typeof value === "object") {
      // Serialize objects and arrays as JSON
      valueToStore = JSON.stringify(value);
    } else {
      // Store primitives as strings
      valueToStore = String(value);
    }

    // Update or insert into database
    await this.db
      .insert(config)
      .values({
        moduleName: module,
        key,
        value: valueToStore,
      })
      .onConflictDoUpdate({
        target: [config.moduleName, config.key],
        set: {
          value: valueToStore,
          updatedAt: new Date(),
        },
      });
  }

  /**
   * Format a value for display
   */
  private formatValue(value: unknown): string {
    if (value === undefined || value === null) {
      return chalk.dim("(not set)");
    }

    if (typeof value === "boolean") {
      return value ? chalk.green("true") : chalk.red("false");
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }
}
