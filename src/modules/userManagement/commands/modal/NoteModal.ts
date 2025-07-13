import { ModalSubmitInteraction, TextInputStyle } from "discord.js";
import ModalMenu from "@common/models/ModalMenu";
import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import UserManagementDB from "../../providers/UserManagement.Database";
import { sendLogMessage } from "../../utils/ChannelLogging";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";

export default class NoteModal extends ModalMenu {
  constructor(targetUser: string) {
    super(`noteModal-${targetUser}`, "User Note");

    const noteInput = new TextInputBuilder()
      .setCustomId("noteInput")
      .setLabel("User Note")
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(noteInput);
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
    const note = this.getTextInputValue(interaction, "noteInput");

    const db = UserManagementDB.getInstance();
    db.addNote(targetUser.id, note, interaction.user.id);

    Stumper.info(`Added note for user: ${targetUser.username} by user ${interaction.user.username}`, "userManagement:NoteUserCommand:execute");
    sendLogMessage(`Added note for user: ${targetUser.username} by user ${interaction.user.username} Note: ${note}`);
    await this.replies.reply(`Added note for user: ${targetUser.username}!`);
  }
}
