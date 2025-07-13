import ConfigManager from "@common/config/ConfigManager";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import RulesDB from "@modules/rules/providers/Rules.Database";
import { ChatInputCommandInteraction } from "discord.js";
import Stumper from "stumper";

export default class DeleteAllRulesCommand extends AdminSlashCommand {
  constructor() {
    super("ruledeleteall", "Deletes all of the rules from the channel", { ephermal: true });

    this.data.addStringOption((option) => option.setName("confirm").setDescription("Enter CONFIRM to confirm").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirm: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");

    if (confirm == "CONFIRM") {
      const db = RulesDB.getInstance();
      const messageIds = db.getAllMessageIds();

      const channelId = ConfigManager.getInstance().getConfig("Rules").channelId;

      for (const messageId of messageIds) {
        Stumper.info(`Deleting rule header message ${messageId.headerId} for section ${messageId.id}`, "rules:DeleteAllRulesCommand:execute");
        await discord.messages.deleteMessage(channelId, messageId.headerId);
        Stumper.info(`Deleting rule content message ${messageId.contentId} for section ${messageId.id}`, "rules:DeleteAllRulesCommand:execute");
        await discord.messages.deleteMessage(channelId, messageId.contentId);
      }
      db.blankOutAllMessageIds();
      await this.replies.reply({ content: "Deleted all rules from the channel!" });
    } else {
      await this.replies.reply({ content: "Failed to confirm!" });
    }
  }
}
