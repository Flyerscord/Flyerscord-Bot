import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "../../../../common/models/ContextMenuCommand.js";
import NoteModal from "../modal/NoteModal.js";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Note");
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;
    if (user) {
      const noteModal = new NoteModal(user);

      await interaction.showModal(noteModal.getModal());
    }
    interaction.reply({ content: "Error adding note!", ephemeral: true });
  }
}
