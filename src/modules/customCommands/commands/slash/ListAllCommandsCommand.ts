import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import ConfigManager from "@common/config/ConfigManager";
import discord from "@common/utils/discord/discord";

export default class ListAllCommandsCommand extends AdminSlashCommand {
  constructor() {
    super("customlistall", "List all custom commands. Mostly for debugging purposes.");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "customCommands:ListAllCommandsCommand:execute", true);

    const db = CustomCommandsDB.getInstance();
    const commands = db.getAllCommands();

    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    const outputStrings = commands.map((command) => `${prefix}${command.name}: ${command.text}`);

    const output = this.wrapTextInCodeblock(outputStrings.join("\n"));

    replies.reply(output);
  }

  private wrapTextInCodeblock(text: string): string {
    return `\`\`\`${text}\`\`\``;
  }
}
