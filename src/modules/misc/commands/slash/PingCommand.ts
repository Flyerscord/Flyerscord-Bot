import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand from "../../../../common/models/SlashCommand.ts";

export default class PingCommand extends SlashCommand {
  constructor() {
    super("ping", "Check if the bot is online");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    interaction.reply({ content: "PONG!", ephemeral: true });
  }
}
