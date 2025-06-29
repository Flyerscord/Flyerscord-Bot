import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "../../../../common/models/SlashCommand";
import { updateCommandList } from "../../utils/util";
import CustomCommandsDB from "@modules/customCommands/providers/CustomCommands.Database";

export default class UpdateCommandListCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustomlist", "Update the custom commands list");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const db = CustomCommandsDB.getInstance();

    updateCommandList(db.getAllCommands());

    interaction.editReply({
      content: "Custom Command List Updated!",
    });
  }
}
