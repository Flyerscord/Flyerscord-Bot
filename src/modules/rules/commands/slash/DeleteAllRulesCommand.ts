import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import RuleMessagesDB from "@modules/rules/providers/RuleMessages.Database";
import { ChatInputCommandInteraction } from "discord.js";

export default class DeleteAllRulesCommand extends AdminSlashCommand {
  constructor() {
    super("ruledeleteall", "Deletes all of the rules from the channel", { ephermal: true });

    this.data.addStringOption((option) => option.setName("confirm").setDescription("Enter CONFIRM to confirm").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirm: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");

    if (confirm == "CONFIRM") {
      const db = RuleMessagesDB.getInstance();

      const res = await db.removeAllMessages();
      if (!res) {
        await this.replies.reply({ content: "Error removing all messages!" });
        return;
      }
      await this.replies.reply({ content: "Deleted all messages!" });
    }
  }
}
