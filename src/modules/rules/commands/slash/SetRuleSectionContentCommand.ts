import ConfigManager from "@common/config/ConfigManager";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import RulesDB from "@modules/rules/providers/Rules.Database";
import { createRuleSections, getSectionId } from "@modules/rules/utils/utils";
import { Attachment, ChatInputCommandInteraction } from "discord.js";

export default class SetRuleSectionContentCommand extends AdminSlashCommand {
  constructor() {
    super("rulesset", "Set the content message for a rule section");

    this.data
      .addSubcommand((subcmd) =>
        subcmd
          .setName("content")
          .setDescription("Set the content message for a rule section")
          .addStringOption((option) => option.setName("name").setDescription("The name of the rule section").setRequired(true).setAutocomplete(true))
          .addStringOption((option) => option.setName("content").setDescription("The content message").setRequired(true).setMaxLength(2000)),
      )
      .addSubcommand((subcmd) =>
        subcmd
          .setName("header")
          .setDescription("Set the header message for a rule section")
          .addStringOption((option) => option.setName("name").setDescription("The name of the rule section").setRequired(true).setAutocomplete(true))
          .addAttachmentOption((option) => option.setName("header").setDescription("The header image").setRequired(true)),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "rules:SetRuleSectionContentCommand:execute", true);

    const name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const id = getSectionId(name);

    const db = RulesDB.getInstance();
    let section = db.getSection(id);
    const config = ConfigManager.getInstance().getConfig("Rules");
    const channelId = config.channelId;
    const sectionNames = config.sections;

    if (!section) {
      if (!sectionNames.includes(name)) {
        await replies.reply({ content: "Error finding section!" });
        return;
      }
      await createRuleSections(true);
      section = db.getSection(id)!;
    }

    if (this.isSubCommand(interaction, "content")) {
      const content: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "content");

      await discord.messages.updateMessageWithText(channelId, section.contentMessageId, content);

      db.setSectionContent(id, content);

      await replies.reply(`Updated content for section ${name}!`);
    } else if (this.isSubCommand(interaction, "header")) {
      const header: Attachment = this.getParamValue(interaction, PARAM_TYPES.ATTACHMENT, "header");

      await discord.messages.updateMessageReplaceTextWithImage(channelId, section.headerMessageId, header);

      db.setSectionHeader(id, header.url);

      await replies.reply(`Updated header for section ${name}!`);
    } else {
      await replies.reply({ content: "Invalid subcommand!" });
    }
  }
}
