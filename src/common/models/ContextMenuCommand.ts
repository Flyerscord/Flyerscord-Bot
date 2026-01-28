import {
  MessageContextMenuCommandInteraction,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Stumper from "stumper";
import Command, { ICommandConfig } from "./Command";

export default abstract class ContextMenuCommand extends Command {
  readonly data: ContextMenuCommandBuilder;

  constructor(name: string, options: ICommandConfig = {}) {
    super(name, options.ephemeral ?? false, options.deferReply ?? true);

    this.data = new ContextMenuCommandBuilder().setName(this.name);
  }
}

export abstract class UserContextMenuCommand extends ContextMenuCommand {
  constructor(name: string, options: ICommandConfig = {}) {
    super(name, options);

    this.data.setType(ApplicationCommandType.User.valueOf());
  }

  async run(interaction: UserContextMenuCommandInteraction): Promise<void> {
    Stumper.info(`Running user context menu command for ${this.name}`, "common:ContextMenuCommand:run");
    await this.setupReplies(interaction);
    await this.execute(interaction);
  }

  protected abstract execute(interaction: UserContextMenuCommandInteraction): Promise<void>;
}

export abstract class AdminUserContextMenuCommand extends UserContextMenuCommand {
  constructor(name: string, options: ICommandConfig = {}) {
    super(name, options);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

export abstract class MessageContextMenuCommand extends ContextMenuCommand {
  constructor(name: string, options: ICommandConfig = {}) {
    super(name, options);

    this.data.setType(ApplicationCommandType.Message.valueOf());
  }

  async run(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    Stumper.info(`Running message context menu command for ${this.name}`, "common:ContextMenuCommand:run");
    await this.setupReplies(interaction);
    await this.execute(interaction);
  }

  protected abstract execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}

export abstract class AdminMessageContextMenuCommand extends MessageContextMenuCommand {
  constructor(name: string, options: ICommandConfig = {}) {
    super(name, options);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}
