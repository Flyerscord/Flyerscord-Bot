import { ChatInputCommandInteraction } from "discord.js";

import SlashCommand, { PARAM_TYPES } from "../../models/SlashCommand";

// The 'SlashCommand' could be replaced with 'AdminSlashCommand' if you wanted the command to be only accessible by administrators
export default class Example extends SlashCommand {
  constructor() {
    // Set the name and the description of the command
    super("example", "Example slash command");

    // Set additional configuration for the command if needed
    // There is a string option for the string to be returned to the caller
    this.data.addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Text to be returned")
        .setRequired(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Get the value of the text string option from the interaction
    const text: string = this.getParamValue(
      interaction,
      PARAM_TYPES.STRING,
      "text",
    );

    // Reply to the user with the user supplied text
    interaction.reply(text);
  }
}
