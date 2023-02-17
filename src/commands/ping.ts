import { CommandInteraction } from "discord.js";

import SlashCommand from "../models/SlashCommand";

export default class PingCommand extends SlashCommand {
  constructor() {
    super("ping", "Check if the bot is online!");
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply({ content: "Pong", ephemeral: true });
  }
}
