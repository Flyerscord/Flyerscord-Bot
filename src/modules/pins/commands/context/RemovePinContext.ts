import { MessageContextMenuCommandInteraction } from "discord.js";
import { AdminMessageContextMenuCommand } from "@common/models/ContextMenuCommand";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import PinsDB from "../../db/PinsDB";

export default class RemovePinContext extends AdminMessageContextMenuCommand {
  constructor() {
    super("Remove Pin", { ephermal: true });
  }

  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message = interaction.targetMessage;
    if (!message) {
      await this.replies.reply({ content: "Error removing pin!", ephemeral: true });
      return;
    }

    const db = new PinsDB();
    const config = ConfigManager.getInstance().getConfig("Pins");

    const pinnedMessagePin = await db.getPinByMessageId(message.id);
    const messagePin = await db.getPin(message.id);
    const pin = pinnedMessagePin ?? messagePin;
    if (pin && pin.messageId) {
      const deleted = await discord.messages.deleteMessage(config.channelId, pin.messageId, "Pin removed");
      if (!deleted) {
        await this.replies.reply({ content: "Error removing pin!", ephemeral: true });
        return;
      }
      await db.deletePin(pin.ogMessageId);
      await this.replies.reply({ content: "Pin removed!", ephemeral: true });
      return;
    } else if (pin && !pin.messageId) {
      await this.replies.reply({
        content: "The pinned message was never sent! This is a weird case, please report this to flyerzrule!",
        ephemeral: true,
      });
      return;
    } else {
      await this.replies.reply({ content: "Message is not pinned!", ephemeral: true });
      return;
    }
  }
}
