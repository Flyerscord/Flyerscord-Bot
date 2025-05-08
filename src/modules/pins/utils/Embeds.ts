import IPin from "../interfaces/IPin";
import discord from "../../../common/utils/discord/discord";
import { EmbedBuilder } from "discord.js";

export async function getPinEmbed(pin: IPin): Promise<EmbedBuilder | undefined> {
  const embed = new EmbedBuilder();

  const message = await discord.messages.getMessage(pin.channelId, pin.orignalMessageId);
  if (message == null) {
    return undefined;
  }

  embed.setAuthor({ name: message.author.globalName || message.author.username, iconURL: message.author.avatarURL() || "" });
  if (message.author.accentColor) {
    embed.setColor(message.author.accentColor);
  } else {
    embed.setColor("Random");
  }

  embed.setTimestamp(message.createdAt);

  embed.setDescription(`${message.content}
    [Jump to Message](${message.url})`);

  if (message.attachments.size > 0) {
    const firstAttachment = message.attachments.first();
    if (firstAttachment) {
      embed.setImage(firstAttachment.url);
    }
  }

  return embed;
}
