import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import NoteModal from "../modal/NoteModal";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Note");
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.targetUser;
    if (user) {
      const noteModal = new NoteModal(user);

      await interaction.showModal(noteModal.getModal());
    }
    interaction.editReply({ content: "Error adding note!" });
  }
}
