import { MessageContextMenuCommandInteraction } from "discord.js";
import { AdminMessageContextMenuCommand } from "@common/models/ContextMenuCommand";
import Stumper from "stumper";
import { getPinEmbed } from "../../utils/Embeds";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";
import PinsDB from "../../db/PinsDB";

export default class AddPinContext extends AdminMessageContextMenuCommand {
  constructor() {
    super("Add Pin");
  }

  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message = interaction.targetMessage;
    if (!message) {
      await this.replies.reply({ content: "Error adding pin!", ephemeral: true });
      return;
    }

    const db = new PinsDB();
    const config = ConfigManager.getInstance().getConfig("Pins");

    if (await db.getPinByMessageId(message.id)) {
      await this.replies.reply({ content: "Cannot pin a pinned message!", ephemeral: true });
      return;
    }

    const pin = await db.addPin(message.id, message.channelId, message.createdAt, interaction.user.id);
    if (!pin) {
      Stumper.error(`Failed to add pin for message ${message.id}. Message is already pinned!`, "pins:AddPinContext:execute");
      await this.replies.reply({ content: "Error adding pin! Message is already pinned!", ephemeral: true });
      return;
    }

    const embed = await getPinEmbed(pin);
    if (!embed) {
      Stumper.error(`Failed to get embed for pin message!`, "pins:AddPinContext:execute");
      await this.replies.reply({ content: "Error adding pin!", ephemeral: true });
      return;
    }

    const pinMessage = await discord.messages.sendEmbedToChannel(config.channelId, embed);
    if (!pinMessage) {
      Stumper.error(`Failed to send message to pins channel!`, "pins:AddPinContext:execute");
      await this.replies.reply({ content: "Error adding pin!", ephemeral: true });
      return;
    }

    await db.updateMessageId(message.id, pinMessage.id);

    await this.replies.reply(`Pin added! Checkout <#${config.channelId}> to see all pins!`);
  }
}
