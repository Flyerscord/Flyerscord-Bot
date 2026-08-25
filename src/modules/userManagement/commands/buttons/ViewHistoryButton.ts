import { ButtonInteraction, ButtonStyle } from "discord.js";
import ButtonHandler from "@common/models/ButtonHandler";
import discord from "@common/utils/discord/discord";
import UserManagementDB from "../../db/UserManagementDB";
import { buildHistoryEmbed } from "../../utils/historyEmbed";

export default class ViewHistoryButton extends ButtonHandler {
  constructor() {
    super("usermanagement_view_history", "View History", ButtonStyle.Secondary);
  }

  /**
   * Replies ephemerally to the clicking moderator with the target user's full history, recovered from
   * the `<userId>` data segment of the clicked button's customId.
   */
  protected async execute(interaction: ButtonInteraction): Promise<void> {
    const userId = this.getDataFromId(interaction.customId);
    if (!userId) {
      await this.replies.reply({ content: "Could not determine which user this notification was for.", ephemeral: true });
      return;
    }

    const user = await discord.users.getUser(userId, true);
    if (!user) {
      await this.replies.reply({ content: "Could not find that user.", ephemeral: true });
      return;
    }

    const db = new UserManagementDB();
    const history = await db.getHistory(userId);

    await this.replies.reply({ embeds: [buildHistoryEmbed(user, history)], ephemeral: true });
  }
}
