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

export default abstract class Module {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  async enable(): Promise<void> {
    await this.setup();
    Stumper.success(`${this.name} module enabled!`);
  }

  async disable(): Promise<void> {
    await this.cleanup();
    Stumper.success(`${this.name} module disabled!`);
  }

  protected abstract setup(): Promise<void>;

  protected abstract cleanup(): Promise<void>;

  protected async readInCommands<T>(dir: string, commandsPath: string): Promise<void> {
    const commands: T[] = [];

    const location = `${dir}/commands/${commandsPath}`;
    const files = fs.readdirSync(location);

    Stumper.info(`Reading in commands from ${location}`, "common:Module:readInCommands");

    for (const file of files) {
      if (!file.endsWith(".js")) {
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
        Stumper.debug(`Read in modal: ${command.id}`, "common:Module:readInCommands");
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
