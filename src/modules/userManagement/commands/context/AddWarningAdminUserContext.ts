import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import WarningReasonModal from "../modal/WarningReasonModal";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Warning", { ephermal: true, deferReply: false });
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;
    if (user) {
      const warningModal = new WarningReasonModal(user.id);

      await interaction.showModal(warningModal.getModal());
      return;
    }
    await this.replies.reply("Error adding warning!");
  }
}
