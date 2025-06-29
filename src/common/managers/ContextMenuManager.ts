import { Collection, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";
import ContextMenuCommand from "../models/ContextMenuCommand";
import Stumper from "stumper";
import { Singleton } from "../models/Singleton";

export default class ContextMenuCommandManager extends Singleton {
  private commands: Collection<string, ContextMenuCommand>;
  private registrationInfo: RESTPostAPIContextMenuApplicationCommandsJSONBody[];

  constructor() {
    super();
    this.commands = new Collection();
    this.registrationInfo = [];
  }

  addCommands(commands: ContextMenuCommand[]): void {
    commands.forEach((command) => this.addCommand(command));
  }

  addCommand(command: ContextMenuCommand): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`ContextMenuCommand ${command.name} already exists`, "common:ContextMenuCommandManager:addCommand");
      return;
    }
    this.commands.set(command.name, command);
  }

  getCommands(): Collection<string, ContextMenuCommand> {
    return this.commands;
  }

  hasCommand(command: ContextMenuCommand): boolean {
    return this.commands.has(command.name);
  }

  setRegistrationInfo(registrationInfo: RESTPostAPIContextMenuApplicationCommandsJSONBody[]): void {
    this.registrationInfo = registrationInfo;
  }

  getRegistrationInfo(): RESTPostAPIContextMenuApplicationCommandsJSONBody[] {
    return this.registrationInfo;
  }
}
