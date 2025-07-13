import ConfigManager from "@common/config/ConfigManager";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import RulesDB from "@modules/rules/providers/Rules.Database";
import { createRuleSections, getSectionId } from "@modules/rules/utils/utils";
import { ChatInputCommandInteraction } from "discord.js";

export default class SendAllRulesCommand extends AdminSlashCommand {
  constructor() {
    super("rulessendall", "Sends all of the rules to the channel", true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const config = ConfigManager.getInstance().getConfig("Rules");

    const sectionNames = config.sections;

    const db = RulesDB.getInstance();

    const firstSectionId = getSectionId(sectionNames[0]);
    const firstSection = db.getSection(firstSectionId);
    // If the first section doesn't exist, create rule sections with default content; otherwise, use the existing content
    createRuleSections(!firstSection);

    await this.replies.reply("Sent all rules to the channel!");
  }
}
