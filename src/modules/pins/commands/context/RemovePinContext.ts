import { MessageContextMenuCommandInteraction } from "discord.js";
import { AdminMessageContextMenuCommand } from "@common/models/ContextMenuCommand";
import PinsDB from "../../providers/Pins.Database";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default class RemovePinContext extends AdminMessageContextMenuCommand {
  constructor() {
    super("Remove Pin", { ephermal: true });
  }

  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message = interaction.targetMessage;
    if (!message) {
      this.replies.reply({ content: "Error removing pin!", ephemeral: true });
      return;
    }

    const db = PinsDB.getInstance();
    const config = ConfigManager.getInstance().getConfig("Pins");

    const pinnedMessagePin = db.getPinByMessageId(message.id);
    const messagePin = db.getPin(message.id);
    const pin = pinnedMessagePin ?? messagePin;
    if (pin && pin.messageId) {
      const deleted = discord.messages.deleteMessage(config.channelId, pin.messageId, "Pin removed");
      if (!deleted) {
        this.replies.reply({ content: "Error removing pin!", ephemeral: true });
        return;
      }
      db.deletePin(pin.orignalMessageId);
      this.replies.reply({ content: "Pin removed!", ephemeral: true });
      return;
    } else if (pin && !pin.messageId) {
      this.replies.reply({ content: "The pinned message was never sent! This is a weird case, please report this to flyerzrule!", ephemeral: true });
      return;
    } else {
      this.replies.reply({ content: "Message is not pinned!", ephemeral: true });
      return;
    }
  }
}
