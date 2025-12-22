import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import CustomCommandsDB from "../../db/CustomCommandsDB";

export default class UpdateCommandListCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustomlist", "Update the custom commands list", { ephermal: true });
  }

  async execute(_interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new CustomCommandsDB();

    await db.updateCommandList(await db.getAllCommands());

    await this.replies.reply("Custom Command List Updated!");
  }
}
