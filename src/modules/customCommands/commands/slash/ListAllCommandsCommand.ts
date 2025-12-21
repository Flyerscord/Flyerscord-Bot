import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";
import ConfigManager from "@common/config/ConfigManager";

export default class ListAllCommandsCommand extends AdminSlashCommand {
  constructor() {
    super("customlistall", "List all custom commands. Mostly for debugging purposes.", { ephermal: true });
  }

  async execute(_interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();
    const commands = db.getAllCommands();

    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    const outputStrings = commands.map((command) => `${prefix}${command.name}: ${command.text}`);

    const output = this.wrapTextInCodeblock(outputStrings.join("\n"));

    await this.replies.reply(output);
  }

  private wrapTextInCodeblock(text: string): string {
    return `\`\`\`${text}\`\`\``;
  }
}
