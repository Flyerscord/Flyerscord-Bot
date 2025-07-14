import { TextChannel, EmbedBuilder, Message, Attachment } from "discord.js";

import Stumper from "stumper";
import { AttachmentBuilder } from "discord.js";
import { getChannel, getTextChannel } from "./channels";
import { getUser } from "./users";

export async function getMessage(channelId: string, messageId: string): Promise<Message | undefined> {
  const channel = await getTextChannel(channelId);
  if (channel) {
    try {
      return await channel.messages.fetch(messageId);
    } catch (error) {
      Stumper.caughtError(error, "common:messages:getMessage");
      return undefined;
    }
  }
  return undefined;
}

export async function sendStringReplytoMessage(messageObj: Message, message: string, mentionUser = false): Promise<Message> {
  if (mentionUser) {
    Stumper.debug(`Sending string reply with mention to message: ${messageObj.id}`, "common:messages:sendStringReplytoMessage");
    return await messageObj.reply(message);
  } else {
    Stumper.debug(`Sending string reply to message: ${messageObj.id}`, "common:messages:sendStringReplytoMessage");
    return await (messageObj.channel as TextChannel).send(message);
  }
}

export async function sendEmbedReplytoMessage(messageObj: Message, embed: EmbedBuilder, mentionUser = false): Promise<void> {
  if (mentionUser) {
    Stumper.debug(`Sending embed reply with mention to message: ${messageObj.id}`, "common:messages:sendEmbedReplytoMessage");
    messageObj.reply({ embeds: [embed] });
  } else {
    Stumper.debug(`Sending embed reply to message: ${messageObj.id}`, "common:messages:sendEmbedReplytoMessage");
    (messageObj.channel as TextChannel).send({ embeds: [embed] });
  }
}

export async function sendMessageToChannel(channelId: string, message: string): Promise<Message | undefined> {
  const channel = await getChannel(channelId);
  if (channel && (channel instanceof TextChannel || channel.isThread())) {
    Stumper.debug(`Sending message to channel: ${channelId}`, "common:messages:sendMessageToChannel");
    return await channel.send(message);
  }
  return undefined;
}

export async function sendEmbedToChannel(channelId: string, embed: EmbedBuilder): Promise<Message | undefined> {
  const channel = await getTextChannel(channelId);
  if (channel) {
    Stumper.debug(`Sending embed to channel: ${channelId}`, "common:messages:sendEmbedToChannel");
    return await channel.send({ embeds: [embed] });
  }
  return undefined;
}

export async function sendMessageAndImageBufferToChannel(channelId: string, message: string, attachment: Buffer): Promise<Message | undefined> {
  const channel = await getTextChannel(channelId);
  if (channel) {
    Stumper.debug(`Sending message and image buffer attchment to channel: ${channelId}`, "common:messages:sendMessageAndImageBufferToChannel");
    return await channel.send({ content: message, files: [attachment] });
  }
}

export async function sendMessageAndAttachmentToChannel(
  channelId: string,
  message: string,
  attachment: AttachmentBuilder,
): Promise<Message | undefined> {
  const channel = await getTextChannel(channelId);
  if (channel) {
    Stumper.debug(`Sending message and attachment to channel: ${channelId}`, "common:messages:sendMessageAndAttachmentToChannel");
    return await channel.send({ content: message, files: [attachment] });
  }
}

export async function sendMesssageDMToUser(userId: string, message: string): Promise<Message | undefined> {
  const user = getUser(userId);
  if (user) {
    Stumper.debug(`Sending message to User DM: ${userId}`, "common:messages:sendMesssageDMToUser");
    return await user.send(message);
  }
  return undefined;
}

export async function sendEmbedDMToUser(userId: string, embed: EmbedBuilder): Promise<Message | undefined> {
  const user = getUser(userId);
  if (user) {
    Stumper.debug(`Sending embed to User DM: ${userId}`, "common:messages:sendEmbedDMToUser");
    return await user.send({ embeds: [embed] });
  }
  return undefined;
}

export async function updateMessageWithText(
  channelId: string,
  messageId: string,
  newText: string,
  removeOtherContent: boolean = false,
): Promise<Message | undefined> {
  const message = await getMessage(channelId, messageId);
  if (message) {
    if (removeOtherContent) {
      return await message.edit({ content: newText, embeds: [], files: [], components: [] });
    }
    return await message.edit(newText);
  }
  return undefined;
}

export async function updateMessageWithEmbed(
  channelId: string,
  messageId: string,
  newEmbed: EmbedBuilder,
  removeOtherContent: boolean = false,
): Promise<Message | undefined> {
  const message = await getMessage(channelId, messageId);
  if (message) {
    if (removeOtherContent) {
      return await message.edit({ content: null, embeds: [newEmbed], files: [], components: [] });
    }
    return await message.edit({ embeds: [newEmbed] });
  }
  return undefined;
}

export async function updateMessageReplaceTextWithImage(
  channelId: string,
  messageId: string,
  attachment: Attachment | AttachmentBuilder,
): Promise<Message | undefined> {
  const message = await getMessage(channelId, messageId);
  if (message) {
    return await message.edit({ files: [attachment], content: null });
  }
  return undefined;
}

export async function deleteMessage(channelId: string, messageId: string, reason?: string): Promise<Boolean> {
  try {
    const message = await getMessage(channelId, messageId);
    if (message && message.deletable) {
      await message.delete();
      if (reason) {
        Stumper.debug(`Deleted message ${messageId} with reason: ${reason}`, "common:messages:deleteMessage");
      } else {
        Stumper.debug(`Deleted message ${messageId}`, "common:messages:deleteMessage");
      }
      return true;
    } else if (message && !message.deletable) {
      Stumper.error(`Message ${messageId} is not deletable!`, "common:messages:deleteMessage");
      return false;
    } else {
      Stumper.error(`Message ${messageId} not found!`, "common:messages:deleteMessage");
      return false;
    }
  } catch (error) {
    Stumper.caughtError(error, "common:messages:deleteMessage");
    return false;
  }
}
