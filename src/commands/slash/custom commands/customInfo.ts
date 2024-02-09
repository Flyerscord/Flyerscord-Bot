import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";
import CustomCommandsDB from "../../../providers/CustomCommands.Database";
import discord from "../../../util/discord/discord";

export default class AddCustomCommand extends AdminSlashCommand {
  constructor() {
    super("custominfo", "Returns the info for the specified custom command.");

    this.data.addStringOption((option) =>
      option
        .setName("name")
        .setDescription(`The name of the command to get the info for.`)
        .setRequired(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();

    const commandName: string = this.getParamValue(
      interaction,
      PARAM_TYPES.STRING,
      "name",
    );

    const command = db.getCommand(commandName);

    if (command) {
      const embed = discord.embeds.getCustomCommandEmbed(command);
      interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      interaction.reply({
        content: `A custom comamnd with the name ${commandName} does not exist!`,
        ephemeral: true,
      });
    }
  }
}
