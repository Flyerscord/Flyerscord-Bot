import discord from "@common/utils/discord/discord";
import { EmbedBuilder } from "discord.js";
import { Pin } from "../db/schema";

export async function getPinEmbed(pin: Pin): Promise<EmbedBuilder | undefined> {
  const embed = new EmbedBuilder();

  const message = await discord.messages.getMessage(pin.ogChannelId, pin.ogMessageId);
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

  let content = message.content;
  if (content.length > 2048) {
    content = content.substring(0, 2030) + "\n\n... See Message for full version";
  }

  if (message.embeds.length > 0) {
    const firstEmbed = message.embeds[0];
    const embedData = firstEmbed.data;

    if (embedData.thumbnail && embedData.thumbnail.url) {
      embed.setImage(embedData.thumbnail.url);
      content = "";
    }
  } else if (message.attachments.size > 0) {
    const attachment = message.attachments.first()!;
    if (attachment.contentType?.startsWith("image")) {
      embed.setImage(attachment.url);
      content = "";
    } else if (attachment.contentType?.startsWith("video")) {
      content = "See Message for Video";
    } else {
      content = "See Message for Attachment";
    }
  }

  if (content.length > 0) {
    embed.setDescription(`Channel: ${message.channel.url}

      ${content}

      [Jump to Message](${message.url})`);
  } else {
    embed.setDescription(`Channel: ${message.channel.url}

      [Jump to Message](${message.url})`);
  }

  return embed;
}
