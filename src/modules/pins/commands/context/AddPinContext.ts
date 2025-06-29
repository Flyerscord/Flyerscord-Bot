import { MessageContextMenuCommandInteraction } from "discord.js";
import { AdminMessageContextMenuCommand } from "../../../../common/models/ContextMenuCommand";
import PinsDB from "../../providers/Pins.Database";
import Stumper from "stumper";
import { getPinEmbed } from "../../utils/Embeds";
import discord from "../../../../common/utils/discord/discord";
import PinsModule from "@modules/pins/PinsModule";

export default class AddPinContext extends AdminMessageContextMenuCommand {
  constructor() {
    super("Add Pin");
  }

  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "pins:AddPinContext:execute");

    const message = interaction.targetMessage;
    if (!message) {
      return await replies.reply("Error adding pin!", true);
    }

    const db = PinsDB.getInstance();
    const config = PinsModule.getInstance().config;

    if (db.getPinByMessageId(message.id)) {
      return await replies.reply("Cannot pin a pinned message!", true);
    }

    const pin = db.addPin(message.id, message.channelId, message.createdAt, interaction.user.id);
    if (!pin) {
      Stumper.error(`Failed to add pin for message ${message.id}. Message is already pinned!`, "pins:AddPinContext:execute");
      return await replies.reply("Error adding pin! Message is already pinned!", true);
    }

    const embed = await getPinEmbed(pin);
    if (!embed) {
      Stumper.error(`Failed to get embed for pin message!`, "pins:AddPinContext:execute");
      return await replies.reply("Error adding pin!", true);
    }

    const pinMessage = await discord.messages.sendEmbedToChannel(config.channelId, embed);
    if (!pinMessage) {
      Stumper.error(`Failed to send message to pins channel!`, "pins:AddPinContext:execute");
      return await replies.reply("Error adding pin!", true);
    }

    db.updateMessageId(message.id, pinMessage.id);

    await replies.reply(`Pin added! Checkout <#${config.channelId}> to see all pins!`);
  }
}
