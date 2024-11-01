import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "../../../../common/models/ContextMenuCommand";
import WarningReasonModal from "../modal/WarningReasonModal";

export default class AddNoteAdminUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Warning");
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.targetUser;
    if (user) {
      const warningModal = new WarningReasonModal(user);

      await interaction.showModal(warningModal.getModal());
    }
    interaction.editReply({ content: "Error adding warning!" });
  }
}
