import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import ModalMenu from "../../../models/Modal";
import { ModalSubmitInteraction, TextInputStyle } from "discord.js";

export default class NoteUserModal extends ModalMenu {
  constructor() {
    super("userNote", "Add User Note");

    const noteTextField = new TextInputBuilder()
      .setCustomId("userNoteNote")
      .setLabel("User Note")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(noteTextField);

    this.data.addComponents(row);
  }

  async execute(interaction: ModalSubmitInteraction): Promise<void> {}
}
