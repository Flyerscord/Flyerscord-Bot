/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";

export default abstract class SlashCommand {
  // Contains the behavior of the command
  readonly data: SlashCommandBuilder;

  // The command
  // Ex: "test" would make the command /test
  name: string;

  // A desciption of the command
  description: string;

  constructor(name: string, description: string) {
    // Must be lowercase
    this.name = name.toLowerCase();
    this.description = description;

    // If additional configuration is needed, it can be added in the constructor of the command
    // See the example slash command (src/commands/slash/example.ts)
    this.data = new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false);
  }

  // Called when the command is triggered
  abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

  protected getParamValue(interaction: ChatInputCommandInteraction, type: PARAM_TYPES, paramName: string): any | null {
    let val: any = undefined;
    switch (type) {
      case PARAM_TYPES.STRING:
        val = interaction.options.getString(paramName);
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

  protected isSubCommand(interaction: ChatInputCommandInteraction, subCommandName: string): boolean {
    return interaction.options.getSubcommand() == subCommandName;
  }

  protected isSubCommandGroup(interaction: ChatInputCommandInteraction, subCommandGroupName: string): boolean {
    return interaction.options.getSubcommandGroup() == subCommandGroupName;
  }

  public toString(): string {
    return JSON.stringify(this);
  }
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
