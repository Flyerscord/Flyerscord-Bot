import ConfigManager from "@common/config/ConfigManager";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import RuleMessagesDB from "@modules/rules/providers/RuleMessages.Database";
import RulesDB from "@modules/rules/providers/Rules.Database";
import RuleFile from "@modules/rules/utils/RuleFile";
import { ChatInputCommandInteraction } from "discord.js";
import Stumper from "stumper";

export default class SendAllRulesCommand extends AdminSlashCommand {
  constructor() {
    super("rulessendall", "Sends all of the rules to the channel", { ephermal: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const messagesDb = RuleMessagesDB.getInstance();
    const rulesDb = RulesDB.getInstance();

    const channelId = ConfigManager.getInstance().getConfig("Rules").channelId;

    let numberOfMessages = 0;
    const sectionContents = rulesDb.getAllSections();
    for (const sectionContent of sectionContents) {
      // Increment for the header message
      numberOfMessages++;

      // Add the content pages
      numberOfMessages += sectionContent.contentPages.length;
    }

    const res = await messagesDb.ensureNumberOfMessages(numberOfMessages, true);
    if (!res) {
      Stumper.error(`Failed to ensure number of messages!`, "rules:RuleFile:setRulesFile");
      await this.replies.reply({ content: "Error ensuring number of messages!" });
      return;
    }
    const messages = messagesDb.getMessages();

    let currentMessageIndex = 0;
    for (const sectionContent of sectionContents) {
      if (sectionContent.headerUrl.startsWith("http")) {
        const attachment = await RuleFile.getImageAttachmentFromUrl(sectionContent.headerUrl, sectionContent.name + ".png");
        await discord.messages.updateMessageReplaceTextWithImage(channelId, messages[currentMessageIndex], attachment);
      } else {
        await discord.messages.updateMessageWithText(channelId, messages[currentMessageIndex], sectionContent.headerUrl, true);
      }
      rulesDb.setHeaderMessageId(sectionContent.name, messages[currentMessageIndex]);
      currentMessageIndex++;

      for (let i = 0; i < sectionContent.contentPages.length; i++) {
        const contentPage = sectionContent.contentPages[i];
        await discord.messages.updateMessageWithText(channelId, messages[currentMessageIndex], contentPage.content, true);
        rulesDb.setContentPageMessageId(sectionContent.name, i, messages[currentMessageIndex]);
        currentMessageIndex++;
      }
    }
    await this.replies.reply({ content: "Sent all rules to channel!" });
  }
}
