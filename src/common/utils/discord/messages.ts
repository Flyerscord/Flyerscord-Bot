import { TextChannel, EmbedBuilder, Message } from "discord.js";

import Stumper from "stumper";
import discord from "./discord";
import Time from "../Time";
import Config from "../../config/Config";

export function getMessage(channelId: string, messageId: string): Message | undefined {
  const client = discord.client.client;
  const channel = discord.channels.getChannel(client, channelId);
  if (channel) {
    return (channel as TextChannel).messages.cache.get(messageId);
  }
  return undefined;
}

export async function sendStringReplytoMessage(messageObj: Message, message: string, mentionUser = false): Promise<Message> {
  if (mentionUser) {
    Stumper.info(`Sending string reply with mention to message: ${messageObj.id}`, "sendStringReplytoMessage");
    return await messageObj.reply(message);
  } else {
    Stumper.info(`Sending string reply to message: ${messageObj.id}`, "sendStringReplytoMessage");
    return await (messageObj.channel as TextChannel).send(message);
  }
}

export async function sendEmbedReplytoMessage(messageObj: Message, embed: EmbedBuilder, mentionUser = false) {
  if (mentionUser) {
    Stumper.info(`Sending embed reply with mention to message: ${messageObj.id}`, "sendEmbedReplytoMessage");
    messageObj.reply({ embeds: [embed] });
  } else {
    Stumper.info(`Sending embed reply to message: ${messageObj.id}`, "sendEmbedReplytoMessage");
    (messageObj.channel as TextChannel).send({ embeds: [embed] });
  }
}

export async function sendMessageToChannel(channelId: string, message: string): Promise<Message | undefined> {
  const client = discord.client.client;
  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (channel) {
    Stumper.info(`Sending message to channel: ${channelId}`, "sendMessageToChannel");
    return await channel.send(message);
  }
  return undefined;
}

export async function sendEmbedToChannel(channelId: string, embed: EmbedBuilder): Promise<Message | undefined> {
  const client = discord.client.client;
  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (channel) {
    Stumper.info(`Sending embed to channel: ${channelId}`, "sendEmbedToChannel");
    return await channel?.send({ embeds: [embed] });
  }
  return undefined;
}

export async function sendMesssageDMToUser(userId: string, message: string): Promise<Message | undefined> {
  const client = discord.client.client;
  const user = client.users.cache.get(userId);
  if (user) {
    Stumper.info(`Sending message to User DM: ${userId}`, "sendMesssageDMToUser");
    return await user.send(message);
  }
  return undefined;
}

export async function sendEmbedDMToUser(userId: string, embed: EmbedBuilder): Promise<Message | undefined> {
  const client = discord.client.client;
  const user = client.users.cache.get(userId);
  if (user) {
    Stumper.info(`Sending embed to User DM: ${userId}`, "sendEmbedDMToUser");
    return await user.send({ embeds: [embed] });
  }
  return undefined;
}

export async function updateMessageWithText(channelId: string, messageId: string, newText: string): Promise<Message | undefined> {
  const message = getMessage(channelId, messageId);
  if (message) {
    return message.edit(newText);
  }
  return undefined;
}

export async function updateMessageWithEmbed(channelId: string, messageId: string, newEmbed: EmbedBuilder): Promise<Message | undefined> {
  const message = getMessage(channelId, messageId);
  if (message) {
    return message.edit({ embeds: [newEmbed] });
  }
  return undefined;
}
