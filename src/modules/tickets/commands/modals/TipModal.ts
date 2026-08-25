import { ActionRowBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import ModalMenu from "@common/models/ModalMenu";
import ConfigManager from "@common/managers/ConfigManager";
import { submitTicket } from "../../utils/submitTicket";

const CONTENT_INPUT_ID = "tip-content";

export default class TipModal extends ModalMenu {
  constructor() {
    super("tip", "Submit an Anonymous Tip", true);

    const contentInput = new TextInputBuilder()
      .setCustomId(CONTENT_INPUT_ID)
      .setLabel("Your tip")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(4000);

    this.data.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput));
  }

  protected async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const content = this.getTextInputValue(interaction, CONTENT_INPUT_ID);
    const reviewChannelId = ConfigManager.getInstance().getConfig("Tickets")["tip.reviewChannelId"];
    await submitTicket("tip", interaction, content, reviewChannelId, this.replies);
  }
}
