import { ModalSubmitInteraction, TextInputStyle, User } from "discord.js";
import ModalMenu from "../../../../common/models/ModalMenu.js";
import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import UserManagementDB from "../../providers/UserManagement.Database.js";
import { sendLogMessage } from "../../utils/ChannelLogging.js";
import Stumper from "stumper";

export default class WarningReasonModal extends ModalMenu {
  targetUser: User;

  constructor(targetUser: User) {
    super("warningReasonModal", "User Warning Reason");
    this.targetUser = targetUser;

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
    const reason = this.getTextInputValue(interaction, "warningReasonInput");

    const db = UserManagementDB.getInstance();
    db.addWarning(interaction.user.id, reason);

    Stumper.info(`Added warning for user: ${this.targetUser.username} by user ${interaction.user.username}`, "WarnUserCommand");
    sendLogMessage(`Added warning for user: ${this.targetUser.username} by user ${interaction.user.username} Reason: ${reason}`);
    interaction.reply(`Added warning for user: ${this.targetUser.username}!`);
  }
}
