import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { updateCommandList } from "../../utils/util";
import CustomCommandsDB from "@modules/customCommands/providers/CustomCommands.Database";

export default class UpdateCommandListCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustomlist", "Update the custom commands list", { ephermal: true });
  }

  async execute(_interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();

    updateCommandList(db.getAllCommands());

    this.replies.reply("Custom Command List Updated!");
  }
}
