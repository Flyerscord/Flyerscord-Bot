import { Message } from "discord.js";
import ITextCommandOptions from "../interfaces/TextCommandOptions";

export default abstract class TextCommand {
  // A friendly name for the command (useful if the command is abbreviated)
  name: string;

  // The string not including the prefix that triggers the command
  command: string;

  // A description of the command, can be used to keep track of what the command does
  description: string;

  // Contains the optional permissions for the command
  options?: ITextCommandOptions;

  constructor(name: string, command: string, options?: ITextCommandOptions) {
    this.name = name;
    this.command = command;
    this.options = options;
    this.description = options?.description || "";
  }

  // The method to be called when the command is triggered
  abstract execute(message: Message, args: Array<string>): Promise<void>;

  // Call this function to make sure the command caller has the correct permissions
  protected checkPermissions(message: Message): boolean {
    if (this.options) {
      if (this.options.allowedPermissions) {
        for (let i = 0; i < this.options.allowedPermissions.length; i++) {
          const permission = this.options.allowedPermissions[i];
          if (message.member?.permissions.has(permission)) {
            return true;
          }
        }
      }

      if (this.options.allowedUsers) {
        if (message.member?.user.id && this.options.allowedUsers.includes(message.member?.user.id)) {
          return true;
        }
      }

      if (this.options.allowedRoles) {
        for (let i = 0; i < this.options.allowedRoles.length; i++) {
          const role = this.options.allowedRoles[i];
          if (message.member?.roles.cache.has(role)) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

export abstract class CustomTextCommand extends TextCommand {
  private content: string;

  constructor(command: string, content: string) {
    super(command, command);
    this.content = content;
  }

  async execute(message: Message): Promise<void> {
    message.channel.send(this.content);
  }
}
