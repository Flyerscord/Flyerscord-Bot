import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionsBitField } from "discord.js";

export abstract class SlashCommand {
  readonly data: SlashCommandBuilder;

  name: string;

  description: string;

  constructor(name: string, description: string) {
    this.name = name.toLowerCase();
    this.description = description;

    this.data = new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }

  protected getParamValue(interaction: ChatInputCommandInteraction, type: PARAM_TYPES, paramName: string): any | null {
    let val = undefined;
    switch (type) {
      case PARAM_TYPES.STRING:
        val = interaction.options.getString(paramName) || "";
        break;
      case PARAM_TYPES.ROLE:
        val = interaction.options.getRole(paramName);
        break;
      case PARAM_TYPES.BOOLEAN:
        val = interaction.options.getBoolean(paramName);
        break;
      case PARAM_TYPES.CHANNEL:
        val = interaction.options.getChannel(paramName);
        break;
      case PARAM_TYPES.ATTACHMENT:
        val = interaction.options.getAttachment(paramName);
        break;
      case PARAM_TYPES.INTEGER:
        val = interaction.options.getInteger(paramName);
        break;
      case PARAM_TYPES.MEMBER:
        val = interaction.options.getMember(paramName);
        break;
      case PARAM_TYPES.USER:
        val = interaction.options.getUser(paramName);
        break;
    }
    return val;
  }

  abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export abstract class AdminSlashCommand extends SlashCommand {
  constructor(name: string, description: string) {
    super(name, description);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

export enum PARAM_TYPES {
  STRING,
  INTEGER,
  BOOLEAN,
  ROLE,
  CHANNEL,
  USER,
  MEMBER,
  ATTACHMENT,
}
