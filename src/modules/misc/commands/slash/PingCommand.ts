import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand from "@common/models/SlashCommand";
import BotHealthManager from "@common/managers/BotHealthManager";
import discord from "@common/utils/discord/discord";

export default class PingCommand extends SlashCommand {
  constructor() {
    super("ping", "Check if the bot is online and its health");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "misc:PingCommand:execute", true);

    const healthManager = BotHealthManager.getInstance();
    await replies.reply({
      content: `PONG! ${healthManager.isHealthy() && interaction.client.isReady() ? "Bot is healthy!" : "Bot is not healthy!"}`,
    });
  }
}
