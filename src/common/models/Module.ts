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
import type { IKeyedObject } from "../interfaces/IKeyedObject";
import type { Modules, ModuleConfigMap } from "../../modules/Modules";
import ConfigManager from "../managers/ConfigManager";
import SchemaManager from "../managers/SchemaManager";
import { TableEnumRecord } from "../db/schema-types";
import { z } from "zod";

export interface IModuleConfigSchema<TKey extends string> {
  key: TKey;
  schema: z.ZodType;
  defaultValue: z.infer<z.ZodType>;
  required: boolean;
  description: string;
  secret: boolean;
  requiresRestart: boolean;
}

export default abstract class Module<TConfigKeys extends string> extends Singleton {
  readonly name: Modules;
  readonly dependsOn: Modules[];

  private registered: boolean = false;
  private configValid: boolean = false;
  private started: boolean = false;

  protected constructor(name: Modules, config: IKeyedObject, schemas: TableEnumRecord = {}, dependsOn: Modules[] = []) {
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
      Stumper.error(`Module ${this.name} has already been registered!`, "common:Module:register");
      return;
    }
    await this.registerConfigSchema();
    this.registered = true;
  }

  async enable(): Promise<boolean> {
    if (this.registered) {
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
      Stumper.success(`${this.name} module enabled!`);
      return true;
    } else {
      Stumper.error(`Module ${this.name} has not been registered!`, "common:Module:enable");
      return false;
    }
  }

  async disable(): Promise<boolean> {
    try {
      await this.cleanup();
    } catch (error) {
      Stumper.caughtError(error, `module:${this.name}:disable`);
      return false;
    }
    Stumper.success(`${this.name} module disabled!`);
    return true;
  }

  getDependencies(): Modules[] {
    return this.dependsOn;
  }

  protected async readInCommands<T>(dir: string, commandsPath: string): Promise<void> {
    const commands: T[] = [];

    const location = `${dir}/commands/${commandsPath}`;
    const files = fs.readdirSync(location);

    Stumper.info(`Reading in commands from ${location}`, "common:Module:readInCommands");

    for (const file of files) {
      if (!file.endsWith(".js") && !file.endsWith(".ts")) {
        continue;
      }

      const Command = await import(`${location}/${file}`);
      const command: T = new Command.default();

      if (command instanceof SlashCommand) {
        Stumper.debug(`Read in slash command: ${command.name}`, "common:Module:readInCommands");
      } else if (command instanceof TextCommand) {
        Stumper.debug(`Read in text command: ${command.name}`, "common:Module:readInCommands");
      } else if (command instanceof ContextMenuCommand) {
        Stumper.debug(`Read in context menu: ${command.name}`, "common:Module:readInCommands");
      } else if (command instanceof ModalMenu) {
        Stumper.debug(`Read in modal: ${command.name}`, "common:Module:readInCommands");
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
      Stumper.error(`Module ${this.name} has invalid configs`, "common:Module:enable");
      return false;
    }
    return true;
  }
}
