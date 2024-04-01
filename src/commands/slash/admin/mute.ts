import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";
import Stumper from "stumper";

export default class MuteSlashCommand extends AdminSlashCommand {
  constructor() {
    super("mute", "Mute a user");

    this.data
      .addMentionableOption((option) => option.setName("user").setDescription("The user to mute").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("The reason for muting.").setRequired(true))
      .addNumberOption((option) =>
        option.setName("time").setDescription("The number of minutes to mute the user for").setMinValue(0).setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member: GuildMember = this.getParamValue(interaction, PARAM_TYPES.MEMBER, "user");
    const reason: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "reason");
    const time: number = this.getParamValue(interaction, PARAM_TYPES.INTEGER, "time");

    // TODO: Add logic for muting user to the discord lib

    Stumper.warning(
      `User ${member.displayName || member.user.username} (id: ${member.user.id}) has been muted by ${interaction.user.username}!`,
      "MuteSlashCommand",
    );
    interaction.reply(`User ${member.displayName || member.user.username} has been muted!`);
  }
}
