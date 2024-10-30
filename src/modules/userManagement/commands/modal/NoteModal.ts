import { ModalSubmitInteraction, TextInputStyle, User } from "discord.js";
import ModalMenu from "../../../../common/models/ModalMenu";
import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import UserManagementDB from "../../providers/UserManagement.Database";
import { sendLogMessage } from "../../utils/ChannelLogging";
import Stumper from "stumper";

export default class NoteModal extends ModalMenu {
  targetUser: User;

  constructor(targetUser: User) {
    super("noteModal", "User Note");
    this.targetUser = targetUser;

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
    const note = this.getTextInputValue(interaction, "noteInput");

    const db = UserManagementDB.getInstance();
    db.addNote(this.targetUser.id, note);

    Stumper.info(`Added note for user: ${this.targetUser.username} by user ${interaction.user.username}`, "userManagement:NoteUserCommand:execute");
    sendLogMessage(`Added note for user: ${this.targetUser.username} by user ${interaction.user.username} Note: ${note}`);
    interaction.reply(`Added note for user: ${this.targetUser.username}!`);
  }
}
