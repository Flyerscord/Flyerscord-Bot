import ConfigManager from "@common/config/ConfigManager";
import ModalMenu from "@common/models/ModalMenu";
import discord from "@common/utils/discord/discord";
import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import RulesDB from "@modules/rules/providers/Rules.Database";
import { getSectionId } from "@modules/rules/utils/utils";
import { ModalSubmitInteraction, TextInputStyle, User } from "discord.js";

export default class RuleSectionContentModal extends ModalMenu {
  targetUser: User;
  sectionName: string;

  constructor(targetUser: User, sectionName: string) {
    super("rulesContentModal", "Rules Content");
    this.targetUser = targetUser;
    this.sectionName = sectionName;

    const contentInput = new TextInputBuilder()
      .setCustomId("content")
      .setLabel("Rule Section Content")
      .setMinLength(1)
      .setMaxLength(2000)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput);
    this.data.addComponents(actionRow);
  }

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const id = getSectionId(this.sectionName);

    const db = RulesDB.getInstance();
    const channelId = ConfigManager.getInstance().getConfig("Rules").channelId;

    const content = this.getTextInputValue(interaction, "content");

    const section = db.getSection(id);
    if (!section) {
      await this.replies.reply({ content: "Error finding section!" });
      return;
    }

    await discord.messages.updateMessageWithText(channelId, section.contentMessageId, content);

    db.setSectionContent(id, content);

    await this.replies.reply(`Updated content for section ${this.sectionName}!`);
  }
}
