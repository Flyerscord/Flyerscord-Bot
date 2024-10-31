import { Channel, ForumChannel, ForumThreadChannel, TextChannel, VoiceChannel } from "discord.js";
import ClientManager from "../../managers/ClientManager";

export async function getChannel(channelId: string): Promise<Channel | null> {
  const client = ClientManager.getInstance().client;
  return await client.channels.fetch(channelId);
}

export async function getForumChannel(channelId: string): Promise<ForumChannel | undefined> {
  const channel = await getChannel(channelId);
  if (channel && channel instanceof ForumChannel) {
    return channel;
  }
  return undefined;
}

export async function getTextChannel(channelId: string): Promise<TextChannel | undefined> {
  const channel = await getChannel(channelId);
  if (channel && channel instanceof TextChannel) {
    return channel;
  }
  return undefined;
}

export async function getForumPostChannel(forumChannelId: string, postChannelId: string): Promise<ForumThreadChannel | null | undefined> {
  const forumChannel = await getForumChannel(forumChannelId);
  if (forumChannel) {
    return await forumChannel.threads.fetch(postChannelId);
  }
  return undefined;
}

export async function getVoiceChannel(channelId: string): Promise<VoiceChannel | undefined> {
  const channel = await getChannel(channelId);
  if (channel && channel instanceof VoiceChannel) {
    return channel;
  }
  return undefined;
}
