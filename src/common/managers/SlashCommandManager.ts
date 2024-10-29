import { Collection } from "discord.js";
import SlashCommand from "../models/SlashCommand.js";
import Stumper from "stumper";

export default class SlashCommandManager {
  private static instance: SlashCommandManager;

  private commands: Collection<string, SlashCommand>;

  private constructor() {
    this.commands = new Collection();
  }

  public static getInstance(): SlashCommandManager {
    if (!SlashCommandManager.instance) {
      SlashCommandManager.instance = new SlashCommandManager();
    }
    return SlashCommandManager.instance;
  }

  public addCommands(commands: Array<SlashCommand>): void {
    commands.forEach((command) => this.addCommand(command));
  }

  public addCommand(command: SlashCommand): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`Slash command ${command.name} already exists`);
      return;
    }
    this.commands.set(command.name, command);
  }

  public getCommands(): Collection<string, SlashCommand> {
    return this.commands;
  }

  public hasCommand(command: SlashCommand): boolean {
    return this.commands.has(command.name);
  }
}
