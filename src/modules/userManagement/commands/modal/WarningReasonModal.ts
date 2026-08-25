import { ModalSubmitInteraction, TextInputStyle } from "discord.js";
import ModalMenu from "@common/models/ModalMenu";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import UserManagementDB from "../../db/UserManagementDB";
import { buildHistoryEmbed } from "../../utils/historyEmbed";
import { getNotificationRow } from "../../utils/notificationRow";

const REASON_INPUT_ID = "reason";

export default class WarningReasonModal extends ModalMenu {
  constructor() {
    super("warningReasonModal", "Add Warning");

    this.data.addLabelComponents((label) =>
      label
        .setLabel("Reason")
        .setTextInputComponent((input) => input.setCustomId(REASON_INPUT_ID).setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)),
    );
  }

  /**
   * Submitted by both `AddWarningUserContext` (`customId` = `warningReasonModal-<userId>`) and
   * `AddWarningMessageContext` (`customId` = `warningReasonModal-<userId>-<messageId>-<channelId>`).
   * The target user id is always used, not the moderator's, since the modal is shown to the moderator
   * but is warning someone else.
   */
  protected async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const [, userId, messageId, channelId] = interaction.customId.split("-");
    if (!userId) {
      await this.replies.reply({ content: "Could not determine which user to warn.", ephemeral: true });
      return;
    }

    const reason = this.getTextInputValue(interaction, REASON_INPUT_ID);

    let messageContent: string | undefined;
    if (messageId && channelId) {
      const message = await discord.messages.getMessage(channelId, messageId);
      messageContent = message?.content;
    }

    const db = new UserManagementDB();
    await db.addWarning(userId, interaction.user.id, reason, messageId, channelId, messageContent);

    const user = await discord.users.getUser(userId, true);
    if (user) {
      const config = ConfigManager.getInstance().getConfig("UserManagement");
      const history = await db.getHistory(userId);
      const embed = buildHistoryEmbed(user, history, "Warnings").setTitle(`Warning added for ${user.username}`);
      await discord.messages.sendEmbedToChannel(config.notificationChannelId, embed, [getNotificationRow(userId)]);
    }

    await this.replies.reply({ content: `Warning added for <@${userId}>.`, ephemeral: true });
  }
}
