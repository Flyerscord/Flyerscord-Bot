import { Message } from "discord.js";

export default abstract class TextCommand {
  // A friendly name for the command (useful if the command is abbreviated)
  name: string;

  // The string not including the prefix that triggers the command
  command: string;

  constructor(name: string, command: string) {
    this.name = name;
    this.command = command;
  }

  // The method to be called when the command is triggered
  abstract execute(message: Message, args: Array<string>): Promise<void>;
}
