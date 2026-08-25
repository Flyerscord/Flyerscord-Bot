import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand from "@common/models/SlashCommand";
import TipModal from "../modals/TipModal";

export default class TipCommand extends SlashCommand {
  constructor() {
    super("tip", "Submit an anonymous tip", { deferReply: false, omitUserIdFromAuditLog: true });
  }

  /**
   * Opens the tip submission modal. Must not defer first, since `showModal` has to be the
   * interaction's first response.
   */
  protected async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.showModal(new TipModal().getModal());
  }
}
