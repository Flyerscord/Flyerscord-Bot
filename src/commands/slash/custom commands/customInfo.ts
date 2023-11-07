import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand } from "../../../models/SlashCommand";
import CustomCommandsDB from "../../../providers/CustomCommands.Database";
import Config from "../../../config/Config";

export default class AddCustomCommand extends AdminSlashCommand {
  constructor() {
    super("custominfo", "Returns the info for the specified custom command.");

    this.data.addStringOption((option) =>
      option.setName("name").setDescription(`The name of the command to get the info for.`).setRequired(true)
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {}
}
