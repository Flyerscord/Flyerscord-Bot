import { MessageContextMenuCommandInteraction } from "discord.js";
import { AdminMessageContextMenuCommand } from "@common/models/ContextMenuCommand";
import PinsDB from "../../providers/Pins.Database";
import Stumper from "stumper";
import { getPinEmbed } from "../../utils/Embeds";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default class AddPinContext extends AdminMessageContextMenuCommand {
  constructor() {
    super("Add Pin");
  }

  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message = interaction.targetMessage;
    if (!message) {
      this.replies.reply({ content: "Error adding pin!", ephemeral: true });
      return;
    }

    const db = PinsDB.getInstance();
    const config = ConfigManager.getInstance().getConfig("Pins");

    if (db.getPinByMessageId(message.id)) {
      this.replies.reply({ content: "Cannot pin a pinned message!", ephemeral: true });
      return;
    }

    const pin = db.addPin(message.id, message.channelId, message.createdAt, interaction.user.id);
    if (!pin) {
      Stumper.error(`Failed to add pin for message ${message.id}. Message is already pinned!`, "pins:AddPinContext:execute");
      this.replies.reply({ content: "Error adding pin! Message is already pinned!", ephemeral: true });
      return;
    }

    const embed = await getPinEmbed(pin);
    if (!embed) {
      Stumper.error(`Failed to get embed for pin message!`, "pins:AddPinContext:execute");
      this.replies.reply({ content: "Error adding pin!", ephemeral: true });
      return;
    }

    const pinMessage = await discord.messages.sendEmbedToChannel(config.channelId, embed);
    if (!pinMessage) {
      Stumper.error(`Failed to send message to pins channel!`, "pins:AddPinContext:execute");
      this.replies.reply({ content: "Error adding pin!", ephemeral: true });
      return;
    }

    db.updateMessageId(message.id, pinMessage.id);

    this.replies.reply(`Pin added! Checkout <#${config.channelId}> to see all pins!`);
  }
}
