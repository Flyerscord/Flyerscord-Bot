import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { removeOldEmojis } from "../../utils/PlayerEmojis";

export default class RemovePlayerEmojisCommand extends AdminSlashCommand {
  constructor() {
    super("removeplayeremojis", "Remove all player emojis (May take a while)");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    await removeOldEmojis();

    interaction.editReply({ content: "Removed all player emojis!" });
  }
}
