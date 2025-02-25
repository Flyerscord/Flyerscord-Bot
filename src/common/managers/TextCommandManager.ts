import { Collection } from "discord.js";
import TextCommand from "../models/TextCommand";
import Stumper from "stumper";

export default class TextCommandManager {
  private static instance: TextCommandManager;

  private commands: Collection<string, TextCommand>;

  private constructor() {
    this.commands = new Collection();
  }

  static getInstance(): TextCommandManager {
    return this.instance || (this.instance = new this());
  }

  addCommands(commands: TextCommand[]): void {
    commands.forEach((command) => this.addCommand(command));
  }

  addCommand(command: TextCommand): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`Text command ${command.name} already exists`, "common:TextCommandManager:addCommand");
      return;
    }
    this.commands.set(command.name, command);
  }

  getCommands(): Collection<string, TextCommand> {
    return this.commands;
  }

  hasCommand(command: TextCommand): boolean {
    return this.commands.has(command.name);
  }
}
