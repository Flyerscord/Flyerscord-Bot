import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import WarningReasonModal from "../modal/WarningReasonModal";
import discord from "@common/utils/discord/discord";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Warning");
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "userManagement:AddWarningAdminUserContext:execute", true);

    const user = interaction.targetUser;
    if (user) {
      const warningModal = new WarningReasonModal(user);

      await interaction.showModal(warningModal.getModal());
    }
    await replies.reply("Error adding warning!");
  }
}
