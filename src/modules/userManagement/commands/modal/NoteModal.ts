import { ModalSubmitInteraction, TextInputStyle } from "discord.js";
import ModalMenu from "@common/models/ModalMenu";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import UserManagementDB from "../../db/UserManagementDB";
import { buildHistoryEmbed } from "../../utils/historyEmbed";
import { getNotificationRow } from "../../utils/notificationRow";

const NOTE_INPUT_ID = "note";

export default class NoteModal extends ModalMenu {
  constructor() {
    super("noteModal", "Add Note");

    this.data.addLabelComponents((label) =>
      label
        .setLabel("Note")
        .setTextInputComponent((input) => input.setCustomId(NOTE_INPUT_ID).setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)),
    );
  }

  /**
   * Submitted by `AddNoteUserContext` (`customId` = `noteModal-<userId>`). The target user id is
   * always used, not the moderator's, since the modal is shown to the moderator but is noting someone
   * else.
   */
  protected async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const userId = this.getDataFromId(interaction.customId);
    if (!userId) {
      await this.replies.reply({ content: "Could not determine which user to note.", ephemeral: true });
      return;
    }

    const note = this.getTextInputValue(interaction, NOTE_INPUT_ID);

    const db = new UserManagementDB();
    await db.addNote(userId, interaction.user.id, note);

    const user = await discord.users.getUser(userId, true);
    if (user) {
      const config = ConfigManager.getInstance().getConfig("UserManagement");
      const history = await db.getHistory(userId);
      const embed = buildHistoryEmbed(user, history, "Notes").setTitle(`Note added for ${user.username}`);
      await discord.messages.sendEmbedToChannel(config.notificationChannelId, embed, [getNotificationRow(userId)]);
    }

    await this.replies.reply({ content: `Note added for <@${userId}>.`, ephemeral: true });
  }
}
