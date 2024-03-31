import { ChatInputCommandInteraction } from "discord.js";

import { AdminSlashCommand } from "../../../models/SlashCommand";
import { updateCommandList } from "../../../util/utils";

export default class AddCustomCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustomlist", "Update the custom commands list");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    updateCommandList();

    interaction.reply({
      content: "Custom Command List Updated!",
      ephemeral: true,
    });
  }
}
