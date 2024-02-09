import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";
import Config from "../../../config/Config";
import CustomCommandsDB from "../../../providers/CustomCommands.Database";

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
    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(
      interaction,
      PARAM_TYPES.STRING,
      "name",
    );
    const response: string = this.getParamValue(
      interaction,
      PARAM_TYPES.STRING,
      "response",
    );

    name = name.toLowerCase();

    if (db.hasCommand(name)) {
      interaction.reply({
        content: `Command ${Config.getConfig().prefixes.custom}${name} already exists!`,
        ephemeral: true,
      });
      return;
    }

    db.addCommand(name, response, interaction.user.id);
    interaction.reply({
      content: `Command ${Config.getConfig().prefixes.custom}${name} added!`,
      ephemeral: true,
    });
  }
}
