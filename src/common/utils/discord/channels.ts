import { Channel, ForumChannel, ForumThreadChannel, TextChannel, VoiceChannel } from "discord.js";
import ClientManager from "../../managers/ClientManager";
import Stumper from "stumper";

export async function getChannel(channelId: string): Promise<Channel | undefined> {
  const client = ClientManager.getInstance().client;
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      return channel;
    }
    return undefined;
  } catch (error) {
    Stumper.caughtError(error, "common:channels:getChannel");
    return undefined;
  }
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

export async function getForumPostChannel(forumChannelId: string, postChannelId: string): Promise<ForumThreadChannel | undefined> {
  const forumChannel = await getForumChannel(forumChannelId);
  if (forumChannel) {
    try {
      const postChannel = await forumChannel.threads.fetch(postChannelId);
      if (postChannel) {
        return postChannel;
      }
      return undefined;
    } catch (error) {
      Stumper.caughtError(error, "common:channels:getForumPostChannel");
      return undefined;
    }
  }
}

export async function getVoiceChannel(channelId: string): Promise<VoiceChannel | undefined> {
  const channel = await getChannel(channelId);
  if (channel && channel instanceof VoiceChannel) {
    return channel;
  }
  return undefined;
}
