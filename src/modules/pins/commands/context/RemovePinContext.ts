import { MessageContextMenuCommandInteraction } from "discord.js";
import { AdminMessageContextMenuCommand } from "../../../../common/models/ContextMenuCommand";
import PinsDB from "../../providers/Pins.Database";
import discord from "../../../../common/utils/discord/discord";
import Config from "../../../../common/config/Config";

export default class RemovePinContext extends AdminMessageContextMenuCommand {
  constructor() {
    super("Remove Pin");
  }

  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "pins:RemovePinContext:execute", true);

    const message = interaction.targetMessage;
    if (!message) {
      return await replies.reply("Error removing pin!", true);
    }

    const db = PinsDB.getInstance();

    const pinnedMessagePin = db.getPinByMessageId(message.id);
    const messagePin = db.getPin(message.id);
    const pin = pinnedMessagePin ?? messagePin;
    if (pin && pin.messageId) {
      const deleted = discord.messages.deleteMessage(Config.getConfig().pinsChannelId, pin.messageId, "Pin removed");
      if (!deleted) {
        return await replies.reply("Error removing pin!", true);
      }
      db.deletePin(pin.orignalMessageId);
      return await replies.reply("Pin removed!", true);
    } else if (pin && !pin.messageId) {
      return await replies.reply("The pinned message was never sent! This is a weird case, please report this to flyerzrule!", true);
    } else {
      return await replies.reply("Message is not pinned!", true);
    }
  }
}
