import ModalMenu from "@common/models/ModalMenu";
import { ModalSubmitInteraction, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default class CreateNewPostModal extends ModalMenu {
  constructor() {
    super("CreateNewPostModal", "Create New Post");

    let currentId = 0;

    const infoText = new TextDisplayBuilder().setId(currentId++).setContent("Make sure you follow the instructions and match specified formats!");

    const opponentInput = new TextInputBuilder().setId(currentId++).setLabel("Opponent").setRequired(true).setStyle(TextInputStyle.Short);

    this.data.addTextDisplayComponents([infoText]).addLabelComponents;
  }

  protected async execute(interaction: ModalSubmitInteraction): Promise<void> {}
}
