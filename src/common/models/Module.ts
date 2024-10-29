import ModuleSetupMissingException from "../exceptions/ModuleSetupMissingException";
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
import { dirname } from "path";
import { fileURLToPath } from "url";

export default abstract class Module {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  public enable(): void {
    this.setup();
    Stumper.info(`Module: ${this.name} enabled`);
  }

  protected setup(): void {
    throw new ModuleSetupMissingException();
  }

  protected async readInCommands<T>(commandsPath: string): Promise<void> {
    const commands: Array<T> = [];

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const location = `${__dirname}/commands/${commandsPath}`;
    const files = fs.readdirSync(location);

    Stumper.info(`Reading in commands from ${location}`, "readInCommands");

    for (const file of files) {
      const Command = await import(`${location}/${file}`);
      const command: T = new Command().default();

      if (command instanceof SlashCommand || command instanceof TextCommand || command instanceof ContextMenuCommand) {
        Stumper.debug(`Read in command: ${command.name}`, "readInCommands");
      } else if (command instanceof ModalMenu) {
        Stumper.debug(`Read in modal: ${command.id}`, "readInCommands");
      }

      commands.push(command);
    }

    this.addCommandsToManager<T>(commands);
  }

  private addCommandsToManager<T>(commands: Array<T>): void {
    if (commands.length > 0) {
      const firstCommand = commands[0];

      if (firstCommand instanceof SlashCommand) {
        SlashCommandManager.getInstance().addCommands(commands as Array<SlashCommand>);
      } else if (firstCommand instanceof TextCommand) {
        TextCommandManager.getInstance().addCommands(commands as Array<TextCommand>);
      } else if (firstCommand instanceof ModalMenu) {
        ModalMenuManager.getInstance().addCommands(commands as Array<ModalMenu>);
      } else if (firstCommand instanceof ContextMenuCommand) {
        ContextMenuCommandManager.getInstance().addCommands(commands as Array<ContextMenuCommand>);
      }
    }
  }
}
