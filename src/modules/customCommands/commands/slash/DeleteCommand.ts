import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import Config from "../../../../common/config/Config";

export default class DeleteCommand extends AdminSlashCommand {
  constructor() {
    super("removecustom", "Remove a custom command");

    this.data.addStringOption((option) => option.setName("name").setDescription(`The name of the command. Case insensitive`).setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      interaction.reply({
        content: `Command ${Config.getConfig().prefix}${name} does not exist!`,
        ephemeral: true,
      });
      return;
    }

    db.removeCommand(name, interaction.user.id);
    interaction.reply({
      content: `Command ${Config.getConfig().prefix}${name} removed!`,
      ephemeral: true,
    });
  }
}
