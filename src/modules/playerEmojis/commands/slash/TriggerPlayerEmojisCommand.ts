import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { checkForNewEmojis } from "../../utils/PlayerEmojis";

export default class TriggerPlayerEmojisCommand extends AdminSlashCommand {
  constructor() {
    super("triggerplayeremojis", "Manually trigger the player emoji process");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    await checkForNewEmojis();

    interaction.editReply({ content: "Triggered player emoji process!" });
  }
}
