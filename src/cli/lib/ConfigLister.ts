import chalk from "chalk";
import Table from "cli-table3";
import ConfigManager from "@common/managers/ConfigManager";
import type { Modules } from "@modules/Modules";

export class ConfigLister {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * List all modules
   */
  listModules(): void {
    const modules = this.configManager.getAllModules();

    if (modules.length === 0) {
      console.log(chalk.yellow("No modules registered"));
      return;
    }

    console.log(chalk.bold.blue("\nRegistered Modules:"));
    console.log(chalk.gray("─".repeat(50)));

    const table = new Table({
      head: [chalk.cyan("Module Name"), chalk.cyan("Config Count")],
      colWidths: [30, 15],
    });

    // Sort modules alphabetically
    const sortedModules = modules.sort();

    for (const module of sortedModules) {
      const schemas = this.configManager.getModuleConfigSchemas(module);
      table.push([module, schemas.length.toString()]);
    }

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal modules: ${modules.length}`));
  }

  /**
   * List all config keys for a specific module
   */
  listModuleKeys(module: Modules): void {
    const schemas = this.configManager.getModuleConfigSchemas(module);

    if (schemas.length === 0) {
      console.log(chalk.yellow(`\nNo config keys found for module: ${module}`));
      return;
    }

    console.log(chalk.bold.blue(`\nConfig Keys for ${module}:`));
    console.log(chalk.gray("─".repeat(80)));

    const table = new Table({
      head: [chalk.cyan("Key"), chalk.cyan("Required"), chalk.cyan("Secret"), chalk.cyan("Restart Required")],
      colWidths: [40, 12, 10, 18],
    });

    // Sort keys alphabetically
    const sortedSchemas = [...schemas].sort((a, b) => a.key.localeCompare(b.key));

    for (const schema of sortedSchemas) {
      table.push([
        schema.key,
        schema.required ? chalk.green("Yes") : chalk.gray("No"),
        schema.secret ? chalk.yellow("Yes") : chalk.gray("No"),
        schema.requiresRestart ? chalk.red("Yes") : chalk.gray("No"),
      ]);
    }

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal keys: ${schemas.length}`));
  }

  /**
   * List all modules and their keys
   */
  listAll(): void {
    const modules = this.configManager.getAllModules();

    if (modules.length === 0) {
      console.log(chalk.yellow("No modules registered"));
      return;
    }

    console.log(chalk.bold.blue("\nAll Modules and Config Keys:"));
    console.log(chalk.gray("═".repeat(100)));

    // Sort modules alphabetically
    const sortedModules = modules.sort();

    for (const module of sortedModules) {
      const schemas = this.configManager.getModuleConfigSchemas(module);

      console.log(chalk.bold.cyan(`\n${module}`), chalk.gray(`(${schemas.length} keys)`));

      if (schemas.length === 0) {
        console.log(chalk.gray("  No config keys"));
        continue;
      }

      const table = new Table({
        head: [chalk.cyan("Key"), chalk.cyan("Req"), chalk.cyan("Sec"), chalk.cyan("Restart")],
        colWidths: [40, 6, 6, 9],
        style: { "padding-left": 2 },
      });

      // Sort keys alphabetically
      const sortedSchemas = [...schemas].sort((a, b) => a.key.localeCompare(b.key));

      for (const schema of sortedSchemas) {
        table.push([
          schema.key,
          schema.required ? chalk.green("✓") : chalk.gray("✗"),
          schema.secret ? chalk.yellow("✓") : chalk.gray("✗"),
          schema.requiresRestart ? chalk.red("✓") : chalk.gray("✗"),
        ]);
      }

      console.log(table.toString());
    }

    console.log(chalk.gray(`\n${"═".repeat(100)}`));
    console.log(chalk.bold(`Total modules: ${modules.length}`));
  }
}
