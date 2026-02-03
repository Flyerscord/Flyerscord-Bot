import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import { UserContextMenuCommandInteraction } from "discord.js";

export default class AddUserNoteContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add User Note");
  }

  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;
  }
}
