import { ButtonInteraction, ButtonStyle } from "discord.js";
import ButtonHandler from "@common/models/ButtonHandler";

export default class CopyUserIdButton extends ButtonHandler {
  constructor() {
    super("usermanagement_copy_id", "Copy User ID", ButtonStyle.Secondary);
  }

  /**
   * Discord buttons can't write to the clipboard directly, so this replies ephemerally with the raw
   * user ID in a code block for the moderator to copy manually.
   */
  protected async execute(interaction: ButtonInteraction): Promise<void> {
    const userId = this.getDataFromId(interaction.customId);
    if (!userId) {
      await this.replies.reply({ content: "Could not determine which user this notification was for.", ephemeral: true });
      return;
    }

    await this.replies.reply({ content: `\`${userId}\``, ephemeral: true });
  }
}
