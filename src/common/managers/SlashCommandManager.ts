import { Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import SlashCommand from "../models/SlashCommand";
import Stumper from "stumper";
import { Singleton } from "../models/Singleton";

export default class SlashCommandManager extends Singleton {
  private commands: Collection<string, SlashCommand>;
  private registrationInfo: RESTPostAPIChatInputApplicationCommandsJSONBody[];

  constructor() {
    super();
    this.commands = new Collection();
    this.registrationInfo = [];
  }

  addCommands(commands: SlashCommand[]): void {
    commands.forEach((command) => this.addCommand(command));
  }

  addCommand(command: SlashCommand): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`Slash command ${command.name} already exists`, "common:SlashCommandManager:addCommand");
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
