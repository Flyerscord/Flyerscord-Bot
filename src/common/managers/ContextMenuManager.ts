import { Collection } from "discord.js";
import ContextMenuCommand from "../models/ContextMenuCommand.js";
import Stumper from "stumper";

export default class ContextMenuCommandManager {
  private static instance: ContextMenuCommandManager;

  private commands: Collection<string, ContextMenuCommand>;

  private constructor() {
    this.commands = new Collection();
  }

  public static getInstance(): ContextMenuCommandManager {
    if (!ContextMenuCommandManager.instance) {
      ContextMenuCommandManager.instance = new ContextMenuCommandManager();
    }
    return ContextMenuCommandManager.instance;
  }

  public addCommands(commands: Array<ContextMenuCommand>): void {
    commands.forEach((command) => this.addCommand(command));
  }

  public addCommand(command: ContextMenuCommand): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`ContextMenuCommand ${command.name} already exists`);
      return;
    }
    this.commands.set(command.name, command);
  }

  public getCommands(): Collection<string, ContextMenuCommand> {
    return this.commands;
  }

  public hasCommand(command: ContextMenuCommand): boolean {
    return this.commands.has(command.name);
  }
}
