import { Command } from "commander";
import chalk from "chalk";
import { ConfigViewer } from "@cli/lib/ConfigViewer";
import { ConfigSetter } from "@cli/lib/ConfigSetter";
import { ConfigLister } from "@cli/lib/ConfigLister";
import type { Modules } from "@modules/Modules";

export class ConfigCLI {
  private program: Command;
  private viewer: ConfigViewer;
  private setter: ConfigSetter;
  private lister: ConfigLister;

  constructor() {
    this.program = new Command();
    this.viewer = new ConfigViewer();
    this.setter = new ConfigSetter();
    this.lister = new ConfigLister();
    this.setupCommands();
  }

  /**
   * Setup CLI commands
   */
  private setupCommands(): void {
    this.program.name("config-tool").description("CLI tool for managing bot configuration").version("1.0.0");

    // View command
    this.program
      .command("view")
      .description("View configuration values")
      .option("-m, --module <module>", "Filter by module name")
      .option("-k, --key <key>", "View specific config key (format: Module.key)")
      .option("--show-secrets", "Show decrypted secret values", false)
      .action(async (options) => {
        try {
          await this.handleView(options);
        } catch (error) {
          console.error(chalk.red("Error:"), error);
          process.exit(1);
        }
      });

    // Set command
    this.program
      .command("set")
      .description("Set configuration values interactively")
      .option("-m, --module <module>", "Jump to specific module")
      .option("-k, --key <key>", "Jump to specific config key")
      .action(async (options) => {
        try {
          await this.handleSet(options);
        } catch (error) {
          console.error(chalk.red("Error:"), error);
          process.exit(1);
        }
      });

    // List command
    this.program
      .command("list")
      .description("List available modules and config keys")
      .option("-m, --module <module>", "List config keys for a specific module")
      .option("-a, --all", "List all modules with their config keys", false)
      .action(async (options) => {
        try {
          await this.handleList(options);
        } catch (error) {
          console.error(chalk.red("Error:"), error);
          process.exit(1);
        }
      });
  }

  /**
   * Handle view command
   */
  private async handleView(options: { module?: string; key?: string; showSecrets?: boolean }): Promise<void> {
    const viewOptions: {
      module?: Modules;
      key?: string;
      showSecrets?: boolean;
    } = {
      showSecrets: options.showSecrets || false,
    };

    // Parse module
    if (options.module) {
      viewOptions.module = options.module as Modules;
    }

    // Parse key (if format is Module.key, extract both)
    if (options.key) {
      if (options.key.includes(".")) {
        const [module, key] = options.key.split(".");
        viewOptions.module = module as Modules;
        viewOptions.key = key;
      } else {
        viewOptions.key = options.key;
      }
    }

    await this.viewer.view(viewOptions);
  }

  /**
   * Handle set command
   */
  private async handleSet(options: { module?: string; key?: string }): Promise<void> {
    const setOptions: {
      module?: Modules;
      key?: string;
    } = {};

    // Parse module
    if (options.module) {
      setOptions.module = options.module as Modules;
    }

    // Parse key
    if (options.key) {
      setOptions.key = options.key;
    }

    await this.setter.set(setOptions);
  }

  /**
   * Handle list command
   */
  private async handleList(options: { module?: string; all?: boolean }): Promise<void> {
    if (options.all) {
      // List all modules with their keys
      this.lister.listAll();
    } else if (options.module) {
      // List keys for specific module
      this.lister.listModuleKeys(options.module as Modules);
    } else {
      // List all modules (default behavior)
      this.lister.listModules();
    }
  }

  /**
   * Run the CLI
   */
  async run(argv: string[]): Promise<void> {
    await this.program.parseAsync(argv);
  }
}
