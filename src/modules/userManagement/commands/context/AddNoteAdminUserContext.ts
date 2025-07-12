import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import NoteModal from "../modal/NoteModal";
import discord from "@common/utils/discord/discord";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Note");
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "userManagement:AddNoteAdminUserContext:execute", true);

    const user = interaction.targetUser;
    if (user) {
      const noteModal = new NoteModal(user);

      await interaction.showModal(noteModal.getModal());
    }
    await replies.reply("Error adding note!");
  }
}
