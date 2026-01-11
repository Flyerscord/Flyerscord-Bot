import Stumper from "stumper";
import SlashCommand from "./SlashCommand";
import ModalMenu from "./ModalMenu";
import TextCommand from "./TextCommand";
import ContextMenuCommand from "./ContextMenuCommand";
import fs from "fs";
import SlashCommandManager from "../managers/SlashCommandManager";
import ModalMenuManager from "../managers/ModalMenuManager";
import TextCommandManager from "../managers/TextCommandManager";
import ContextMenuCommandManager from "../managers/ContextMenuManager";
import { Singleton } from "./Singleton";
import type { Modules } from "../../modules/Modules";
import ConfigManager from "../managers/ConfigManager";
import SchemaManager from "../managers/SchemaManager";
import { TableEnumRecord } from "../db/schema-types";
import { z } from "zod";

export interface IModuleConfigSchema<TKey extends string> {
  /**
   * The key of the config in the database
   */
  key: TKey;
  /**
   * The description of the config setting
   */
  description: string;
  /**
   * Whether the config is required for the module to function
   */
  required: boolean;
  /**
   * Whether the config is secret and should not be displayed in the UI
   */
  secret: boolean;
  /**
   * Whether the config requires a restart of the bot to take effect
   */
  requiresRestart: boolean;
  /**
   * The default value of the config setting. Only used if the config is not required.
   */
  defaultValue: z.infer<z.ZodType>;
  /**
   * The Zod schema for the config setting. If the value is encryped a transform is used in the schema.
   */
  schema: z.ZodType;
}

export default abstract class Module<TConfigKeys extends string> extends Singleton {
  readonly name: Modules;
  readonly dependsOn: Modules[];

  private registered: boolean = false;
  private configValid: boolean = false;
  private started: boolean = false;

  protected constructor(name: Modules, schemas: TableEnumRecord = {}, dependsOn: Modules[] = []) {
    super();

    this.name = name;
    this.dependsOn = dependsOn;

    SchemaManager.getInstance().register(schemas);
  }

  isConfigValid(): boolean {
    return this.configValid;
  }

  isStarted(): boolean {
    return this.started;
  }

  isRegistered(): boolean {
    return this.registered;
  }

  protected abstract setup(): Promise<void>;

  protected abstract cleanup(): Promise<void>;

  abstract getConfigSchema(): IModuleConfigSchema<TConfigKeys>[];

  private async registerConfigSchema(): Promise<void> {
    const configManager = ConfigManager.getInstance();
    const configSchemas = this.getConfigSchema();

    for (const configInfo of configSchemas) {
      await configManager.addNewConfigSchema(this.name, configInfo);
    }
  }

  async register(): Promise<void> {
    if (this.registered) {
      Stumper.error(`Module ${this.name} has already been registered!`, `common:Module:${this.name}:register`);
      return;
    }
    await this.registerConfigSchema();
    Stumper.success(`Module ${this.name} registered!`, `common:Module:${this.name}:register`);
    this.registered = true;
  }

  async enable(): Promise<boolean> {
    if (!this.registered) {
      Stumper.error(`Module ${this.name} has not been registered!`, `common:Module:${this.name}:enable`);
      return false;
    }

    if (!this.validateConfig()) {
      return false;
    }
    this.configValid = true;

    try {
      await this.setup();
    } catch (error) {
      Stumper.caughtError(error, `module:${this.name}:enable`);
      return false;
    }

    this.started = true;
    Stumper.success(`${this.name} module enabled!`, `common:Module:${this.name}:enable`);
    return true;
  }

  async disable(): Promise<boolean> {
    try {
      await this.cleanup();
    } catch (error) {
      Stumper.caughtError(error, `module:${this.name}:disable`);
      return false;
    }
    Stumper.success(`${this.name} module disabled!`, `common:Module:${this.name}:disable`);
    return true;
  }

  getDependencies(): Modules[] {
    return this.dependsOn;
  }

  protected async readInCommands<T>(dir: string, commandsPath: string): Promise<void> {
    const commands: T[] = [];

    const location = `${dir}/commands/${commandsPath}`;
    const files = fs.readdirSync(location);

    Stumper.info(`Reading in commands from ${location}`, `common:Module:${this.name}:readInCommands`);

    for (const file of files) {
      if (!file.endsWith(".js") && !file.endsWith(".ts")) {
        continue;
      }

      const Command = await import(`${location}/${file}`);
      const command: T = new Command.default();

      if (command instanceof SlashCommand) {
        Stumper.debug(`Read in slash command: ${command.name}`, `common:Module:${this.name}:readInCommands`);
      } else if (command instanceof TextCommand) {
        Stumper.debug(`Read in text command: ${command.name}`, `common:Module:${this.name}:readInCommands`);
      } else if (command instanceof ContextMenuCommand) {
        Stumper.debug(`Read in context menu: ${command.name}`, `common:Module:${this.name}:readInCommands`);
      } else if (command instanceof ModalMenu) {
        Stumper.debug(`Read in modal: ${command.name}`, `common:Module:${this.name}:readInCommands`);
      }

      commands.push(command);
    }

    this.addCommandsToManager<T>(commands);
  }

  private addCommandsToManager<T>(commands: T[]): void {
    if (commands.length > 0) {
      const firstCommand = commands[0];

      if (firstCommand instanceof SlashCommand) {
        SlashCommandManager.getInstance().addCommands(commands as SlashCommand[]);
      } else if (firstCommand instanceof TextCommand) {
        TextCommandManager.getInstance().addCommands(commands as TextCommand[]);
      } else if (firstCommand instanceof ModalMenu) {
        ModalMenuManager.getInstance().addCommands(commands as ModalMenu[]);
      } else if (firstCommand instanceof ContextMenuCommand) {
        ContextMenuCommandManager.getInstance().addCommands(commands as ContextMenuCommand[]);
      }
    }
  }

  private validateConfig(): boolean {
    const configManager = ConfigManager.getInstance();
    if (!configManager.validateModule(this.name)) {
      Stumper.error(`Module ${this.name} has invalid configs`, "common:Module:${this.name}:validateConfig");
      return false;
    }
    return true;
  }
}
