import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand from "@common/models/SlashCommand";
import BotHealthManager from "@common/managers/BotHealthManager";

export default class PingCommand extends SlashCommand {
  constructor() {
    super("ping", "Check if the bot is online and its health");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const healthManager = BotHealthManager.getInstance();
    interaction.editReply({
      content: `PONG! ${healthManager.isHealthy() && interaction.client.isReady() ? "Bot is healthy!" : "Bot is not healthy!"}`,
    });
  }
}
