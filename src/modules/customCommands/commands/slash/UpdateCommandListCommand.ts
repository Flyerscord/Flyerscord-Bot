import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "../../../../common/models/SlashCommand";
import { updateCommandList } from "../../utils/util";

export default class UpdateCommandListCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustomlist", "Update the custom commands list");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    updateCommandList();

    interaction.editReply({
      content: "Custom Command List Updated!",
    });
  }
}
