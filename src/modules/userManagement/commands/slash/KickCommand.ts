import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import Stumper from "stumper";

import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import { sendLogMessage } from "../../utils/ChannelLogging.js";

export default class KickSlashCommand extends AdminSlashCommand {
  constructor() {
    super("kick", "Kick a user");

    this.data
      .addMentionableOption((option) => option.setName("user").setDescription("The user to kick").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("The reason for kicking.").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member: GuildMember = this.getParamValue(interaction, PARAM_TYPES.MEMBER, "user");
    const reason: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "reason");

    await member.kick(reason);

    Stumper.warning(
      `User ${member.displayName || member.user.username} (id: ${member.user.id}) has been kicked by ${interaction.user.username}! Reason: ${reason}`,
      "KickSlashCommand",
    );
    sendLogMessage(`User ${member.displayName || member.user.username} has been kicked by ${interaction.user.username}! Reason: ${reason}`);

    interaction.reply(`User ${member.displayName || member.user.username} has been kicked!`);
  }
}
