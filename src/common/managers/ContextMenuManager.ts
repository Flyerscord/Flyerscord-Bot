import { Collection } from "discord.js";
import ContextMenuCommand from "../models/ContextMenuCommand";
import Stumper from "stumper";

export default class ContextMenuCommandManager {
  private static instance: ContextMenuCommandManager;

  private commands: Collection<string, ContextMenuCommand>;

  private constructor() {
    this.commands = new Collection();
  }

  static getInstance(): ContextMenuCommandManager {
    if (!ContextMenuCommandManager.instance) {
      ContextMenuCommandManager.instance = new ContextMenuCommandManager();
    }
    return ContextMenuCommandManager.instance;
  }

  addCommands(commands: Array<ContextMenuCommand>): void {
    commands.forEach((command) => this.addCommand(command));
  }

  addCommand(command: ContextMenuCommand): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`ContextMenuCommand ${command.name} already exists`);
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
}
