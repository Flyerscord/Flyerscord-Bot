import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand } from "../../../models/SlashCommand";
import Config from "../../../config/Config";

export default class AddCustomCommand extends AdminSlashCommand {
  constructor() {
    super("addcustom", "Add a custom command");

    this.data
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription(
            `The name of the command. Will be executed with ${Config.getConfig().prefixes.custom}name. Case insensitive`,
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("response")
          .setDescription("The response that the command will respond with")
          .setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    interaction.reply({ content: "PONG!", ephemeral: true });
  }
}
