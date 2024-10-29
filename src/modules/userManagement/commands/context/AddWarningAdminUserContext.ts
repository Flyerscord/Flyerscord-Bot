import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "../../../../common/models/ContextMenuCommand.js";
import WarningReasonModal from "../modal/WarningReasonModal.js";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Warning");
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;
    if (user) {
      const warningModal = new WarningReasonModal(user);

      await interaction.showModal(warningModal.getModal());
    }
    interaction.reply({ content: "Error adding warning!", ephemeral: true });
  }
}
