import discord from "@common/utils/discord/discord";
import { InteractionReplies } from "@common/utils/discord/InteractionReplies";
import {
  MessageContextMenuCommandInteraction,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Stumper from "stumper";

export default abstract class ContextMenuCommand {
  readonly data: ContextMenuCommandBuilder;

  readonly name: string;
  protected readonly ephemeral: boolean;

  replies: InteractionReplies;

  constructor(name: string, ephemeral: boolean = false) {
    this.name = name;
    this.ephemeral = ephemeral;

    this.replies = discord.interactions.createReplies(this.name, this.ephemeral);

    this.data = new ContextMenuCommandBuilder().setName(this.name);
  }
}

export abstract class UserContextMenuCommand extends ContextMenuCommand {
  constructor(name: string, ephemeral: boolean = false) {
    super(name, ephemeral);

    this.data.setType(ApplicationCommandType.User.valueOf());
  }

  async run(interaction: UserContextMenuCommandInteraction): Promise<void> {
    Stumper.info(`Running user context menu command for ${this.name}`, "common:ContextMenuCommand:run");
    this.replies.setInteraction(interaction);
    await this.replies.deferReply();
    await this.execute(interaction);
  }

  protected abstract execute(interaction: UserContextMenuCommandInteraction): Promise<void>;
}

export abstract class AdminUserContextMenuCommand extends UserContextMenuCommand {
  constructor(name: string, ephemeral: boolean = false) {
    super(name, ephemeral);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

export abstract class MessageContextMenuCommand extends ContextMenuCommand {
  constructor(name: string, ephemeral: boolean = false) {
    super(name, ephemeral);

    this.data.setType(ApplicationCommandType.Message.valueOf());
  }

  async run(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    Stumper.info(`Running message context menu command for ${this.name}`, "common:ContextMenuCommand:run");
    this.replies.setInteraction(interaction);
    await this.replies.deferReply();
    await this.execute(interaction);
  }

  protected abstract execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}

export abstract class AdminMessageContextMenuCommand extends MessageContextMenuCommand {
  constructor(name: string, ephemeral: boolean = false) {
    super(name, ephemeral);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}
