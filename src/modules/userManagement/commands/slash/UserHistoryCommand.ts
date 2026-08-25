import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import UserManagementDB from "../../db/UserManagementDB";
import { buildHistoryEmbed, HistoryFilter } from "../../utils/historyEmbed";

export default class UserHistoryCommand extends AdminSlashCommand {
  constructor() {
    super("userhistory", "View a user's warning, note, and moderation history", { ephemeral: true });

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to view the history of").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Which kind of history entries to show")
          .setRequired(false)
          .addChoices(
            { name: "All", value: "All" },
            { name: "Warnings", value: "Warnings" },
            { name: "Notes", value: "Notes" },
            { name: "Moderation Events", value: "ModerationEvents" },
          ),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = this.getUserParamValue(interaction, "user");
    const type = this.getStringParamValue(interaction, "type", "All") as HistoryFilter;

    const db = new UserManagementDB();
    const history = await db.getHistory(user.id);

    await this.replies.reply({ embeds: [buildHistoryEmbed(user, history, type)] });
  }
}
