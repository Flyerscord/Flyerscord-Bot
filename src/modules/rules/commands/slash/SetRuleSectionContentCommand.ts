import { AdminSlashCommand } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import { ChatInputCommandInteraction } from "discord.js";

export default class SetRuleSectionContentCommand extends AdminSlashCommand {
  constructor() {
    super("setrulesectioncontent", "Set the content message for a rule section");

    this.data.addStringOption((option) =>
      option.setName("name").setDescription("The name of the rule section").setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "rules:SetRuleSectionContentCommand:execute");
  }
}
