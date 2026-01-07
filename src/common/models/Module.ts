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
import type { Modules } from "../../modules/Modules";
import ConfigManager, { IConfigInfoNoModule } from "../config/ConfigManager";
import SchemaManager from "../managers/SchemaManager";
import { TableEnumRecord } from "../db/schema-types";
import SeedManager from "../config/seeding/SeedManager";

export interface IModuleConfig<TConfig> {
  [key: string]: TConfig;
}

export default abstract class Module<TConfigKeys extends string> extends Singleton {
  readonly name: Modules;
  readonly dependsOn: Modules[];

  protected constructor(name: Modules, config: IKeyedObject, schemas: TableEnumRecord = {}, dependsOn: Modules[] = []) {
    super();
    this.name = name;

    this.dependsOn = dependsOn;

    SchemaManager.getInstance().register(schemas);
  }

  protected abstract setup(): Promise<void>;

  protected abstract cleanup(): Promise<void>;

  protected abstract setConfigInfo(): IConfigInfoNoModule<TConfigKeys>[];

  private async registerConfigInfo(): Promise<void> {
    const configManager = ConfigManager.getInstance();
    const configInfosWithoutModuleName = this.setConfigInfo();

    const configInfos = configInfosWithoutModuleName.map((configInfo) => {
      return { ...configInfo, moduleName: this.name };
    });

    for (const configInfo of configInfos) {
      await configManager.addNewConfig(configInfo);
    }
  }

  async enable(): Promise<boolean> {
    await this.registerConfigInfo();

    const seedManager = SeedManager.getInstance();
    await seedManager.seedModule(this.name);

    const configManager = ConfigManager.getInstance();
    if (!configManager.validateModule(this.name)) {
      Stumper.error(`Module ${this.name} has invalid configs`, "common:Module:enable");
      return false;
    }

    await this.setup();
    Stumper.success(`${this.name} module enabled!`);
    return true;
  }

  async disable(): Promise<boolean> {
    await this.cleanup();
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
}
