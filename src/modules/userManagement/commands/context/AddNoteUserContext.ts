import { ModalBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import NoteModal from "../modal/NoteModal";

export default class AddNoteUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Note", { deferReply: false });
  }

  /**
   * Shows the note modal for the targeted user.
   */
  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const modal = new NoteModal();
    const modalWithData = ModalBuilder.from(modal.getModal()).setCustomId(`${modal.name}-${interaction.targetUser.id}`);
    await interaction.showModal(modalWithData);
  }
}
