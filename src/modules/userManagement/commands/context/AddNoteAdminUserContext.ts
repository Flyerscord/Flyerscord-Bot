import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import NoteModal from "../modal/NoteModal";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Note", { ephermal: true, deferReply: false });
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;
    if (user) {
      const noteModal = new NoteModal(user.id);

      await interaction.showModal(noteModal.getModal());
      return;
    }
    await this.replies.reply("Error adding note!");
  }
}
