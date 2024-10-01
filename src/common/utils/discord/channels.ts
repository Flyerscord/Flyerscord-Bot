import { Channel, ForumChannel, ForumThreadChannel, TextChannel } from "discord.js";
import ClientManager from "../../managers/ClientManager";

export function getChannel(channelId: string): Channel | undefined {
  const client = ClientManager.getInstance().client;
  return client.channels.cache.get(channelId);
}

export function getForumChannel(channelId: string): ForumChannel | undefined {
  const channel = getChannel(channelId);
  if (channel && channel instanceof ForumChannel) {
    return channel;
  }
  return undefined;
}

export function getTextChannel(channelId: string): TextChannel | undefined {
  const channel = getChannel(channelId);
  if (channel && channel instanceof TextChannel) {
    return channel;
  }
  return undefined;
}

export function getForumPostChannel(forumChannelId: string, postChannelId: string): ForumThreadChannel | undefined {
  const forumChannel = getForumChannel(forumChannelId);
  if (forumChannel) {
    return forumChannel.threads.cache.get(postChannelId);
  }
  return undefined;
}
