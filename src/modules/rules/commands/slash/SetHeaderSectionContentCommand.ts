import ConfigManager from "@common/managers/ConfigManager";
import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import RulesDB from "@modules/rules/db/RulesDB";
import { Attachment, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

export default class SetHeaderSectionContentCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("rulessetheader", "Set the content message for a header section", { ephemeral: true });

    this.data
      .addStringOption((option) => option.setName("name").setDescription("The name of the rule section").setRequired(true).setAutocomplete(true))
      .addAttachmentOption((option) => option.setName("header").setDescription("The header image").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new RulesDB();
    const name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");

    const section = await db.getSection(name);
    const config = ConfigManager.getInstance().getConfig("Rules");
    const channelId = config.channelId;

    if (!section) {
      await this.replies.reply({ content: "Error finding section!" });
      return;
    }

    const header: Attachment = this.getParamValue(interaction, PARAM_TYPES.ATTACHMENT, "header");

    await db.setHeaderUrl(name, header.url);
    if (section.headerMessageId != null && section.headerMessageId !== "") {
      await discord.messages.updateMessageReplaceTextWithImage(channelId, section.headerMessageId, header);
    }

    await this.replies.reply(`Updated header for section ${name}!`);
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);

    if (focusedName == "name") {
      const config = ConfigManager.getInstance().getConfig("Rules");
      return config.sections;
    }
    return undefined;
  }
}
