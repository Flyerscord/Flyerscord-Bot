import { Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import SlashCommand from "../models/SlashCommand";
import Stumper from "stumper";

export default class SlashCommandManager {
  private static instance: SlashCommandManager;

  private commands: Collection<string, SlashCommand>;
  private registrationInfo: RESTPostAPIChatInputApplicationCommandsJSONBody[];

  private constructor() {
    this.commands = new Collection();
    this.registrationInfo = [];
  }

  static getInstance(): SlashCommandManager {
    if (!SlashCommandManager.instance) {
      SlashCommandManager.instance = new SlashCommandManager();
    }
    return SlashCommandManager.instance;
  }

  addCommands(commands: SlashCommand[]): void {
    commands.forEach((command) => this.addCommand(command));
  }

  addCommand(command: SlashCommand): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`Slash command ${command.name} already exists`);
      return;
    }
    this.commands.set(command.name, command);
  }

  getCommands(): Collection<string, SlashCommand> {
    return this.commands;
  }

  hasCommand(command: SlashCommand): boolean {
    return this.commands.has(command.name);
  }

  setRegistrationInfo(registrationInfo: RESTPostAPIChatInputApplicationCommandsJSONBody[]): void {
    this.registrationInfo = registrationInfo;
  }

  getRegistrationInfo(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return this.registrationInfo;
  }
}
