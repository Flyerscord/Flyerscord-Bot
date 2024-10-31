import { ChatInputCommandInteraction } from "discord.js";
import Config from "../../../../common/config/Config";
import { AdminSlashCommand } from "../../../../common/models/SlashCommand";
import CustomCommandsDB from "../../providers/CustomCommands.Database";

export default class ListAllCommandsCommand extends AdminSlashCommand {
  constructor() {
    super("customlistall", "List all custom commands. Mostly for debugging purposes.");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = CustomCommandsDB.getInstance();
    const commands = db.getAllCommands();

    const outputStrings = commands.map((command) => `${Config.getConfig().prefix.normal}${command.name}: ${command.text}`);

    const output = this.wrapTextInCodeblock(outputStrings.join("\n"));

    interaction.reply({ content: output, ephemeral: true });
  }

  private wrapTextInCodeblock(text: string): string {
    return `\`\`\`${text}\`\`\``;
  }
}
