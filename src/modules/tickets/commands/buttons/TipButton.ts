import { ButtonInteraction, ButtonStyle } from "discord.js";
import ButtonHandler from "@common/models/ButtonHandler";
import TipModal from "../modals/TipModal";

export default class TipButton extends ButtonHandler {
  constructor() {
    super("tip-submit", "Submit a Tip", ButtonStyle.Primary, { deferReply: false, omitUserIdFromAuditLog: true });
  }

  /**
   * Opens the tip submission modal. Must not defer first, since `showModal` has to be the
   * interaction's first response.
   */
  protected async execute(interaction: ButtonInteraction): Promise<void> {
    await interaction.showModal(new TipModal().getModal());
  }
}
