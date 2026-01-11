import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import RulesDB from "@modules/rules/db/RulesDB";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { ChatInputCommandInteraction } from "discord.js";

export default class DeleteAllRulesCommand extends AdminSlashCommand {
  constructor() {
    super("ruledeleteall", "Deletes all of the rules from the channel", { ephermal: true });

    this.data.addStringOption((option) => option.setName("confirm").setDescription("Enter CONFIRM to confirm").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirm: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");

    if (confirm == "CONFIRM") {
      const db = new RulesDB();
      const channelId = ConfigManager.getInstance().getConfig("Rules").channelId;

      // Delete from Discord
      const messages = await db.getMessages();
      for (const msgId of messages) {
        await discord.messages.deleteMessage(channelId, msgId);
      }

      // Delete from database
      await db.removeAllMessages();

      await this.replies.reply({ content: "Deleted all messages!" });
    }
  }
}
