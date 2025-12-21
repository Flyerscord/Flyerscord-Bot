import { ModalSubmitInteraction, TextInputStyle } from "discord.js";
import ModalMenu from "@common/models/ModalMenu";
import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import UserManagementDB from "../../providers/UserManagement.Database";
import { sendLogMessage } from "../../utils/ChannelLogging";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";

export default class WarningReasonModal extends ModalMenu {
  constructor(targetUser: string) {
    super(`warningReasonModal-${targetUser}`, "User Warning Reason");

    const reasonInput = new TextInputBuilder()
      .setCustomId("warningReasonInput")
      .setLabel("User Warning Reason")
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
    this.data.addComponents(actionRow);
  }

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const targetUserId = this.getDataFromId(interaction.customId);
    if (!targetUserId) {
      await this.replies.reply({ content: "Error getting target user id!" });
      return;
    }
    const targetUser = discord.users.getUser(targetUserId);
    if (!targetUser) {
      await this.replies.reply({ content: "Error finding target user!" });
      return;
    }

    const reason = this.getTextInputValue(interaction, "warningReasonInput");

    const db = UserManagementDB.getInstance();
    db.addWarning(interaction.user.id, reason, interaction.user.id);

    Stumper.info(`Added warning for user: ${targetUser.username} by user ${interaction.user.username}`, "userManagement:WarningReasonModal:execute");
    await sendLogMessage(`Added warning for user: ${targetUser.username} by user ${interaction.user.username} Reason: ${reason}`);
    await this.replies.reply(`Added warning for user: ${targetUser.username}!`);
  }
}
