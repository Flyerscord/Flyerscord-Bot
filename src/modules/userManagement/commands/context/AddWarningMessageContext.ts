import { MessageContextMenuCommandInteraction, ModalBuilder } from "discord.js";
import { AdminMessageContextMenuCommand } from "@common/models/ContextMenuCommand";
import WarningReasonModal from "../modal/WarningReasonModal";

export default class AddWarningMessageContext extends AdminMessageContextMenuCommand {
  constructor() {
    super("Mark as Warning", { deferReply: false });
  }

  /**
   * Shows the warning-reason modal for the targeted message's author, tying the warning to that
   * specific message so it shows up with a jump link in the user's history.
   */
  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message = interaction.targetMessage;

    const modal = new WarningReasonModal();
    const modalWithData = ModalBuilder.from(modal.getModal()).setCustomId(`${modal.name}-${message.author.id}-${message.id}-${message.channelId}`);
    await interaction.showModal(modalWithData);
  }
}
