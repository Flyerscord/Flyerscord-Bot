import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import CustomCommandsDB from "../../providers/CustomCommands.Database.js";
import Config from "../../../../common/config/Config.js";

export default class EditCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustom", "Update a custom command");

    this.data
      .addStringOption((option) => option.setName("name").setDescription(`The name of the command. Case insensitive`).setRequired(true))
      .addStringOption((option) =>
        option.setName("newresponse").setDescription("The new response that the command will respond with").setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const newResponse: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "newresponse");

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      interaction.reply({
        content: `Command ${Config.getConfig().prefix}${name} does not exist!`,
        ephemeral: true,
      });
      return;
    }

    db.updateCommand(name, newResponse, interaction.user.id);
    interaction.reply({
      content: `Command ${Config.getConfig().prefix}${name} updated!`,
      ephemeral: true,
    });
  }
}
