import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import { updateCommandList } from "../../utils/util";
import CustomCommandsDB from "@modules/customCommands/providers/CustomCommands.Database";
import discord from "@common/utils/discord/discord";

export default class UpdateCommandListCommand extends AdminSlashCommand {
  constructor() {
    super("updatecustomlist", "Update the custom commands list");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "customCommands:UpdateCommandListCommand:execute", true);

    const db = CustomCommandsDB.getInstance();

    updateCommandList(db.getAllCommands());

    replies.reply("Custom Command List Updated!");
  }
}
