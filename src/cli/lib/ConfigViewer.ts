import chalk from "chalk";
import Table from "cli-table3";
import { z } from "zod";
import type { ViewOptions, IConfig } from "./types.js";
import type { Modules } from "../../modules/Modules.js";
import ConfigManager from "../../common/managers/ConfigManager.js";
import { SchemaInspector } from "./SchemaInspector.js";

export class ConfigViewer {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Display configuration values based on options
   */
  async view(options: ViewOptions): Promise<void> {
    if (!this.configManager.isLoaded()) {
      console.error(chalk.red("Error: Configs have not been loaded yet"));
      return;
    }

    // Get all config schemas from ConfigManager
    const allConfigs = (this.configManager as unknown as { configs: Map<Modules, IConfig[]> }).configs;

    if (options.module) {
      // View specific module
      await this.viewModule(options.module, options.showSecrets || false, allConfigs);
    } else {
      // View all modules
      for (const module of allConfigs.keys()) {
        await this.viewModule(module, options.showSecrets || false, allConfigs);
        console.log(); // Add spacing between modules
      }
    }

    // Show reminder about secrets if not showing them
    if (!options.showSecrets) {
      console.log(chalk.dim("\nUse --show-secrets to view encrypted values"));
    }
  }

  /**
   * Display configs for a specific module
   */
  private async viewModule(module: Modules, showSecrets: boolean, allConfigs: Map<Modules, IConfig[]>): Promise<void> {
    const moduleConfigs = allConfigs.get(module);

    if (!moduleConfigs || moduleConfigs.length === 0) {
      console.log(chalk.yellow(`No configs found for module: ${module}`));
      return;
    }

    console.log(chalk.bold.cyan(`\n=== ${module} ===`));

    const table = new Table({
      head: [chalk.bold("Key"), chalk.bold("Description"), chalk.bold("Type"), chalk.bold("Required"), chalk.bold("Current Value")],
      colWidths: [25, 40, 20, 10, 30],
      wordWrap: true,
    });

    for (const configSchema of moduleConfigs) {
      const key = configSchema.key;
      const description = configSchema.description || "-";
      const typeDesc = SchemaInspector.getTypeDescription(configSchema.schema);
      const required = configSchema.required ? chalk.green("Yes") : chalk.dim("No");
      const isSecret = configSchema.secret;

      let displayValue: string;

      if (!configSchema.value && configSchema.value !== false && configSchema.value !== 0) {
        // No value set
        displayValue = chalk.dim(configSchema.required ? chalk.red("<NOT SET>") : `(default: ${configSchema.defaultValue})`);
      } else if (isSecret && !showSecrets) {
        // Secret value, masked
        displayValue = chalk.dim("***********");
      } else {
        // Format value based on type
        displayValue = this.formatValue(configSchema.value, configSchema.schema);
      }

      table.push([key, description, typeDesc, required, displayValue]);
    }

    console.log(table.toString());
  }

  /**
   * Format a value for display
   */
  private formatValue(value: unknown, schema: z.ZodType): string {
    const type = SchemaInspector.getSchemaType(schema);

    if (value === undefined || value === null) {
      return chalk.dim("(not set)");
    }

    if (type === "boolean") {
      return value ? chalk.green("true") : chalk.red("false");
    }

    if (type === "array" || type === "object") {
      // Pretty-print JSON
      return JSON.stringify(value, null, 2);
    }

    // String, number, or other primitives
    return String(value);
  }
}
