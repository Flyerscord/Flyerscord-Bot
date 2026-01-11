import { Message } from "discord.js";
import ITextCommandOptions, { COMMAND_LOCATION } from "../interfaces/ITextCommandOptions";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";

export default abstract class TextCommand {
  readonly prefix: string;
  readonly name: string;
  readonly command: string;
  readonly description: string;
  readonly options?: ITextCommandOptions;

  constructor(prefix: string, name: string, command: string, options?: ITextCommandOptions) {
    this.prefix = prefix;
    this.name = name;
    this.command = command;
    this.options = options;
    this.description = options?.description || "";
  }

  protected abstract execute(message: Message, args: string[]): Promise<void>;

  async run(message: Message, args: string[]): Promise<void> {
    const hasPerms = this.checkPermissions(message);
    const hasLocation = this.checkLocation(message);

    if (hasPerms && hasLocation) {
      await this.execute(message, args);
    } else if (!hasPerms) {
      await message.reply({ content: "You do not have permission to run this command!" });
      Stumper.warning(`User ${message.author.username} tried to run command ${this.name} but did not have permission!`, "common:TextCommand:run");
    } else if (!hasLocation) {
      await message.reply({ content: "This command is not available in this location!" });
      Stumper.warning(
        `User ${message.author.username} tried to run command ${this.name} but it is not available in this location!`,
        "common:TextCommand:run",
      );
    }
  }

  private checkPermissions(message: Message): boolean {
    if (this.options) {
      if (this.options.allowedPermissions) {
        for (const permission of this.options.allowedPermissions) {
          if (message.member?.permissions.has(permission)) {
            return true;
          }
        }
        return false;
      }

      if (this.options.allowedUsers) {
        if (this.options.allowedUsers.includes(message.author.id)) {
          return true;
        }
        return false;
      }

      if (this.options.allowedRoles) {
        for (const role of this.options.allowedRoles) {
          if (message.member?.roles.cache.has(role)) {
            return true;
          }
        }
        return false;
      }
    }
    return true;
  }

  private checkLocation(message: Message): boolean {
    if (this.options && this.options.allowedLocations) {
      // Check if the message is in a guild
      if (message.guild && !this.options.allowedLocations.includes(COMMAND_LOCATION.GUILD)) {
        return false;
      }

      // Check if the message is a DM
      if (message.channel.isDMBased() && !this.options.allowedLocations.includes(COMMAND_LOCATION.DM)) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}

export abstract class AdminTextCommand extends TextCommand {
  constructor(name: string, command: string, options: ITextCommandOptions = {}) {
    options.allowedPermissions = ["Administrator"];
    super(ConfigManager.getInstance().getConfig("Common").adminPrefix, name, command, options);
  }
}

export abstract class AdminDMTextCommand extends TextCommand {
  constructor(name: string, command: string, options: ITextCommandOptions = {}) {
    options.allowedPermissions = ["Administrator"];
    options.allowedLocations = [COMMAND_LOCATION.DM];
    super(ConfigManager.getInstance().getConfig("Common").adminPrefix, name, command, options);
  }
}

export abstract class GuildTextCommand extends TextCommand {
  constructor(prefix: string, name: string, command: string, options: ITextCommandOptions = {}) {
    options.allowedLocations = [COMMAND_LOCATION.GUILD];
    super(prefix, name, command, options);
  }
}

export abstract class DMTextCommand extends TextCommand {
  constructor(prefix: string, name: string, command: string, options: ITextCommandOptions = {}) {
    options.allowedLocations = [COMMAND_LOCATION.DM];
    super(prefix, name, command, options);
  }
}
