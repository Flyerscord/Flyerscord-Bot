import {
  MessageContextMenuCommandInteraction,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  PermissionsBitField,
} from "discord.js";

export default abstract class ContextMenuCommand {
  readonly data: ContextMenuCommandBuilder;

  readonly name: string;

  constructor(name: string) {
    this.name = name;

    this.data = new ContextMenuCommandBuilder().setName(this.name);
  }

  abstract execute(interaction: unknown): Promise<void>;
}

export abstract class UserContextMenuCommand extends ContextMenuCommand {
  constructor(name: string) {
    super(name);

    this.data.setType(ApplicationCommandType.User);
  }

  abstract execute(interaction: UserContextMenuCommandInteraction): Promise<void>;
}

export abstract class AdminUserContextMenuCommand extends UserContextMenuCommand {
  constructor(name: string) {
    super(name);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

export abstract class MessageContextMenuCommand extends ContextMenuCommand {
  constructor(name: string) {
    super(name);

    this.data.setType(ApplicationCommandType.Message);
  }

  abstract execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}

export abstract class AdminMessageContextMenuCommand extends MessageContextMenuCommand {
  constructor(name: string) {
    super(name);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}
