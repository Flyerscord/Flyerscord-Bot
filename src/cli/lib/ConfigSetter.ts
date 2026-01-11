import chalk from "chalk";
import type { SetOptions, IConfig } from "@cli/lib/types";
import type { Modules } from "@modules/Modules";
import ConfigManager from "@common/managers/ConfigManager";
import SecretManager from "@common/managers/SecretManager";
import Database from "@common/db/db";
import { config } from "@common/db/schema";
import { InteractivePrompts } from "@cli/lib/InteractivePrompts";
import { SchemaInspector } from "@cli/lib/SchemaInspector";

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

    // Get all modules
    const modules = this.configManager.getAllModules();

    // Step 1: Select module (if not provided)
    let selectedModule = options.module;
    if (!selectedModule) {
      const sortedModules = modules.sort();
      const moduleChoices = sortedModules.map((module) => {
        const schemas = this.configManager.getModuleConfigSchemas(module);
        return {
          name: `${module} ${chalk.gray(`(${schemas.length} config${schemas.length !== 1 ? "s" : ""})`)}`,
          value: module,
        };
      });

      console.log(chalk.bold.blue("\n📋 Select Module"));
      selectedModule = await InteractivePrompts.selectFromList("Enter number or use arrow keys:", moduleChoices);
    }

    // Step 2: Get module configs
    const moduleConfigs = this.configManager.getModuleConfigSchemas(selectedModule);
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
      const sortedConfigs = [...moduleConfigs].sort((a, b) => a.key.localeCompare(b.key));
      const configChoices = sortedConfigs.map((schema) => {
        const typeDesc = SchemaInspector.getTypeDescription(schema.schema);
        const badges: string[] = [];
        if (schema.required) badges.push(chalk.red("req"));
        if (schema.requiresRestart) badges.push(chalk.magenta("restart"));

        const badgeStr = badges.length > 0 ? ` ${chalk.gray("[")}${badges.join(chalk.gray(", "))}${chalk.gray("]")}` : "";
        return {
          name: `${schema.key} ${chalk.gray(`(${typeDesc})`)}${badgeStr} - ${chalk.dim(schema.description)}`,
          value: schema.key,
        };
      });

      console.log(chalk.bold.blue(`\n⚙️  Select Config Key for ${selectedModule}`));
      const selectedKey = await InteractivePrompts.selectFromList("Enter number or use arrow keys:", configChoices);
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
    console.log(`Encrypted: ${selectedConfigSchema.secret ? chalk.yellow("Yes") : chalk.dim("No")}`);

    const currentValue = selectedConfigSchema.value;
    if (currentValue !== undefined && currentValue !== null) {
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
    console.log(`Old Value: ${this.formatValue(currentValue)}`);
    console.log(`New Value: ${this.formatValue(newValue)}`);
    if (selectedConfigSchema.secret) {
      console.log(chalk.dim("(This value will be encrypted in the database)"));
    }

    // Step 7: Confirm
    const confirmed = await InteractivePrompts.confirm("\nSave this change?", true);

    if (!confirmed) {
      console.log(chalk.yellow("\n✗ Change cancelled"));
      return;
    }

    // Step 8: Save to database
    try {
      // Check if this is an encrypted string by inspecting the schema
      const isEncrypted = SchemaInspector.isEncryptedString(selectedConfigSchema.schema);
      await this.saveConfigValue(selectedModule, selectedConfigSchema.key, newValue, isEncrypted);
      console.log(chalk.green(`\n✓ Successfully updated ${selectedModule}.${selectedConfigSchema.key}`));

      // Warn if restart required
      if (selectedConfigSchema.requiresRestart) {
        console.log(chalk.yellow("\n⚠ This config requires a bot restart to take effect"));
      }

      // Step 9: Ask if user wants to set another config
      const setAnother = await InteractivePrompts.confirm("\nSet another configuration?", true);
      if (setAnother) {
        // Recursively call set() to start over
        await this.set({});
      }
    } catch (error) {
      console.error(chalk.red("\n✗ Failed to save config:"), error);
    }
  }

  /**
   * Save a config value to the database
   */
  private async saveConfigValue(module: Modules, key: string, value: unknown, shouldEncrypt: boolean): Promise<void> {
    // Convert value to string for storage
    let valueToStore: string;

    if (shouldEncrypt && typeof value === "string") {
      // Encrypt values for encryptedString schemas
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
