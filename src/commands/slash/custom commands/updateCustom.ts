import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";
import CustomCommandsDB from "../../../providers/CustomCommands.Database";
import Config from "../../../config/Config";

export default class UpdateCustomCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustom", "Update a custom command");

    this.data
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription(`The name of the command. Case insensitive`)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("newresponse")
          .setDescription("The new response that the command will respond with")
          .setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(
      interaction,
      PARAM_TYPES.STRING,
      "name",
    );
    const newResponse: string = this.getParamValue(
      interaction,
      PARAM_TYPES.STRING,
      "newresponse",
    );

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      interaction.reply({
        content: `Command ${Config.getConfig().prefixes.custom}${name} does not exist!`,
        ephemeral: true,
      });
      return;
    }

    db.updateCommand(name, newResponse, interaction.user.id);
    interaction.reply({
      content: `Command ${Config.getConfig().prefixes.custom}${name} updated!`,
      ephemeral: true,
    });
  }
}
