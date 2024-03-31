import { UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "../../../models/ContextMenuCommand";
import NoteUserModal from "../../modals/admin/noteUser";

export default class NoteUserContextCommand extends AdminUserContextMenuCommand {
  constructor() {
    super("addusernote");
  }

  execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;

    const modal = new NoteUserModal().getModal();

    interaction.showModal(modal);
  }
}
