import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import Config from "../../../../common/config/Config";

export default class DeleteCommand extends AdminSlashCommand {
  constructor() {
    super("customremove", "Remove a custom command");

    this.data.addStringOption((option) =>
      option.setName("name").setDescription(`The name of the command. Case insensitive`).setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      interaction.editReply({
        content: `Command ${Config.getConfig().prefix.normal}${name} does not exist!`,
      });
      return;
    }

    db.removeCommand(name, interaction.user.id);
    interaction.editReply({
      content: `Command ${Config.getConfig().prefix.normal}${name} removed!`,
    });
  }
}
