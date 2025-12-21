import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import ConfigManager from "@common/config/ConfigManager";

export default class DeleteCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("customremove", "Remove a custom command", { ephermal: true });

    this.data.addStringOption((option) =>
      option.setName("name").setDescription(`The name of the command. Case insensitive`).setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    const db = CustomCommandsDB.getInstance();

    let name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");

    name = name.toLowerCase();

    if (!db.hasCommand(name)) {
      await this.replies.reply(`Command ${prefix}${name} does not exist!`);
      return;
    }

    db.removeCommand(name, interaction.user.id);
    await this.replies.reply(`Command ${prefix}${name} removed!`);
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);

    if (focusedName == "name") {
      const db = CustomCommandsDB.getInstance();
      return db.getAllCommandNames();
    }
    return undefined;
  }
}
