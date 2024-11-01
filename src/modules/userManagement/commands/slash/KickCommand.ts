import { ChatInputCommandInteraction, User } from "discord.js";
import Stumper from "stumper";

import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import { sendLogMessage } from "../../utils/ChannelLogging";
import discord from "../../../../common/utils/discord/discord";

export default class KickSlashCommand extends AdminSlashCommand {
  constructor() {
    super("kick", "Kick a user");

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to kick").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("The reason for kicking.").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");
    const reason: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "reason");

    const member = await discord.members.getMember(user.id);

    if (!member) {
      interaction.editReply({ content: "Error finding member!" });
      Stumper.error(`Error finding member for user ${user.id}`, "userManagement:KickSlashCommand:execute");
      return;
    }

    await member.kick(reason);

    Stumper.warning(
      `User ${member.displayName || member.user.username} (id: ${member.user.id}) has been kicked by ${interaction.user.username}! Reason: ${reason}`,
      "userManagement:KickSlashCommand:execute",
    );
    sendLogMessage(
      `User \`${member.displayName || member.user.username}\` has been kicked by \`${interaction.user.username}\`! Reason: \`${reason}\``,
    );

    interaction.followUp({ content: `User ${member.displayName || member.user.username} has been kicked!`, ephemeral: false });
  }
}
