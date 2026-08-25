import { ModalBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { AdminUserContextMenuCommand } from "@common/models/ContextMenuCommand";
import WarningReasonModal from "../modal/WarningReasonModal";

export default class AddWarningUserContext extends AdminUserContextMenuCommand {
  constructor() {
    super("Add Warning", { deferReply: false });
  }

  /**
   * Shows the warning-reason modal for the targeted user. No message is associated with this warning;
   * see `AddWarningMessageContext` for warning based on a specific message.
   */
  async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    const modal = new WarningReasonModal();
    const modalWithData = ModalBuilder.from(modal.getModal()).setCustomId(`${modal.name}-${interaction.targetUser.id}`);
    await interaction.showModal(modalWithData);
  }
}
