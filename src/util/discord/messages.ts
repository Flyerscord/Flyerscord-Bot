import { TextChannel, EmbedBuilder, Client, Message } from "discord.js";

import Logger from "../Logger";

export async function sendStringReplytoMessage(
  messageObj: Message,
  message: string,
  mentionUser = false
): Promise<Message> {
  if (mentionUser) {
    Logger.info(`Sending string reply with mention to message: ${messageObj.id}`, "sendStringReplytoMessage");
    return await messageObj.reply(message);
  } else {
    Logger.info(`Sending string reply to message: ${messageObj.id}`, "sendStringReplytoMessage");
    return await messageObj.channel.send(message);
  }
}

export async function sendEmbedReplytoMessage(messageObj: Message, embed: EmbedBuilder, mentionUser = false) {
  if (mentionUser) {
    Logger.info(`Sending embed reply with mention to message: ${messageObj.id}`, "sendEmbedReplytoMessage");
    messageObj.reply({ embeds: [embed] });
  } else {
    Logger.info(`Sending embed reply to message: ${messageObj.id}`, "sendEmbedReplytoMessage");
    messageObj.channel.send({ embeds: [embed] });
  }
}

export async function sendMessageToChannel(
  client: Client,
  channelId: string,
  message: string
): Promise<Message | undefined> {
  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (channel) {
    Logger.info(`Sending message to channel: ${channelId}`, "sendMessageToChannel");
    return await channel.send(message);
  }
  return undefined;
}

export async function sendEmbedToChannel(
  client: Client,
  channelId: string,
  embed: EmbedBuilder
): Promise<Message | undefined> {
  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (channel) {
    Logger.info(`Sending embed to channel: ${channelId}`, "sendEmbedToChannel");
    return await channel?.send({ embeds: [embed] });
  }
  return undefined;
}

export async function sendMesssageDMToUser(
  client: Client,
  userId: string,
  message: string
): Promise<Message | undefined> {
  const user = client.users.cache.get(userId);
  if (user) {
    Logger.info(`Sending message to User DM: ${userId}`, "sendMesssageDMToUser");
    return await user.send(message);
  }
  return undefined;
}

export async function sendEmbedDMToUser(
  client: Client,
  userId: string,
  embed: EmbedBuilder
): Promise<Message | undefined> {
  const user = client.users.cache.get(userId);
  if (user) {
    Logger.info(`Sending embed to User DM: ${userId}`, "sendEmbedDMToUser");
    return await user.send({ embeds: [embed] });
  }
  return undefined;
}
